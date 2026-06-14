import type { Simulation, SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';

type GraphNodeType = 'post' | 'tag';

interface RawGraphNode {
  id: string;
  title: string;
  type: GraphNodeType;
  href: string;
  size: number;
}

interface RawGraphLink {
  source: string;
  target: string;
  value: number;
}

interface GraphPayload {
  nodes: RawGraphNode[];
  links: RawGraphLink[];
}

type GraphNodeDatum = SimulationNodeDatum & RawGraphNode & {
  fx?: number | null;
  fy?: number | null;
};

type GraphLinkDatum = SimulationLinkDatum<GraphNodeDatum> & {
  source: string | GraphNodeDatum;
  target: string | GraphNodeDatum;
  value: number;
};

const SVG_NS = 'http://www.w3.org/2000/svg';
const WIDTH = 1000;
const HEIGHT = 560;

const roots = document.querySelectorAll<HTMLElement>('[data-graph-root]');

for (const root of roots) {
  const start = () => {
    initGraph(root).catch((error) => console.warn('Graph failed to initialize', error));
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        schedule(start);
      },
      { rootMargin: '160px 0px' },
    );
    observer.observe(root);
  } else {
    schedule(start);
  }
}

function schedule(task: () => void): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout: 1200 });
    return;
  }
  setTimeout(task, 0);
}

async function initGraph(root: HTMLElement): Promise<void> {
  const stage = root.querySelector<HTMLElement>('[data-graph-canvas]');
  if (!stage) return;

  const payload = parsePayload(root);
  const nodes = payload.nodes.map((node) => ({ ...node }));
  const links = payload.links.map((link) => ({ ...link }));
  if (nodes.length === 0) return;

  const staticMode =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.matchMedia('(max-width: 640px)').matches;

  const view = renderGraph(stage, nodes, links);
  stage.dataset.graphState = 'ready';
  if (staticMode || nodes.length < 2) return;

  const d3 = await import('d3-force');
  const simulation = d3
    .forceSimulation<GraphNodeDatum>(nodes)
    .force('link', d3.forceLink<GraphNodeDatum, GraphLinkDatum>(links).id((node) => node.id).distance(148))
    .force('charge', d3.forceManyBody<GraphNodeDatum>().strength((node) => (node.type === 'post' ? -260 : -180)))
    .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
    .force('collide', d3.forceCollide<GraphNodeDatum>().radius((node) => node.size + 18))
    .alpha(0.82)
    .on('tick', view.update);

  view.attachDrag(simulation);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) simulation.stop();
    else simulation.restart();
  });
}

function parsePayload(root: HTMLElement): GraphPayload {
  try {
    return JSON.parse(root.dataset.graph || '{"nodes":[],"links":[]}') as GraphPayload;
  } catch {
    return { nodes: [], links: [] };
  }
}

function renderGraph(stage: HTMLElement, nodes: GraphNodeDatum[], links: GraphLinkDatum[]) {
  stage.textContent = '';
  seedPositions(nodes);

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const svg = createSvg('svg') as SVGSVGElement;
  svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '文章与标签关系图谱');

  const linkLayer = createSvg('g');
  const nodeLayer = createSvg('g');
  svg.append(linkLayer, nodeLayer);
  stage.append(svg);
  const suppressedClickNodes = new WeakSet<GraphNodeDatum>();

  const linkEntries = links
    .filter((link) => nodeById.has(String(link.source)) && nodeById.has(String(link.target)))
    .map((link) => {
      const line = createSvg('line');
      line.setAttribute('class', 'graph-link');
      linkLayer.append(line);
      return { link, line };
    });

  const nodeEntries = nodes.map((node) => {
    const group = createSvg('g');
    group.setAttribute('class', `graph-node graph-node-${node.type}`);
    group.setAttribute('role', 'link');
    group.setAttribute('tabindex', '0');
    group.setAttribute('aria-label', node.title);

    const circle = createSvg('circle');
    circle.setAttribute('r', String(node.size));

    const text = createSvg('text');
    text.setAttribute('y', String(node.size + 18));
    text.textContent = clipLabel(node.title);

    group.append(circle, text);
    nodeLayer.append(group);

    group.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      window.location.assign(node.href);
    });

    group.addEventListener('click', () => {
      if (suppressedClickNodes.has(node)) {
        suppressedClickNodes.delete(node);
        return;
      }
      window.location.assign(node.href);
    });

    return { node, group };
  });

  const update = () => {
    for (const { link, line } of linkEntries) {
      const source = resolveNode(link.source, nodeById);
      const target = resolveNode(link.target, nodeById);
      if (!source || !target) continue;
      line.setAttribute('x1', String(source.x ?? WIDTH / 2));
      line.setAttribute('y1', String(source.y ?? HEIGHT / 2));
      line.setAttribute('x2', String(target.x ?? WIDTH / 2));
      line.setAttribute('y2', String(target.y ?? HEIGHT / 2));
    }
    for (const { node, group } of nodeEntries) {
      group.setAttribute('transform', `translate(${node.x ?? WIDTH / 2},${node.y ?? HEIGHT / 2})`);
    }
  };

  update();

  return {
    update,
    attachDrag(simulation: Simulation<GraphNodeDatum, GraphLinkDatum>) {
      let active:
        | {
            node: GraphNodeDatum;
            pointerId: number;
            startX: number;
            startY: number;
            moved: boolean;
          }
        | null = null;

      for (const { node, group } of nodeEntries) {
        group.addEventListener('pointerdown', (event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          const point = toSvgPoint(svg, event);
          active = { node, pointerId: event.pointerId, startX: point.x, startY: point.y, moved: false };
          node.fx = node.x ?? point.x;
          node.fy = node.y ?? point.y;
          group.setPointerCapture(event.pointerId);
          simulation.alphaTarget(0.22).restart();
        });

        group.addEventListener('pointermove', (event) => {
          if (!active || active.node !== node || active.pointerId !== event.pointerId) return;
          const point = toSvgPoint(svg, event);
          active.moved = active.moved || Math.hypot(point.x - active.startX, point.y - active.startY) > 5;
          node.fx = clamp(point.x, 28, WIDTH - 28);
          node.fy = clamp(point.y, 28, HEIGHT - 28);
          update();
        });

        group.addEventListener('pointerup', (event) => {
          if (!active || active.node !== node || active.pointerId !== event.pointerId) return;
          if (active.moved) {
            suppressedClickNodes.add(node);
            setTimeout(() => suppressedClickNodes.delete(node), 0);
          }
          active = null;
          node.fx = null;
          node.fy = null;
          simulation.alphaTarget(0);
        });

        group.addEventListener('pointercancel', (event) => {
          if (!active || active.node !== node || active.pointerId !== event.pointerId) return;
          active = null;
          node.fx = null;
          node.fy = null;
          simulation.alphaTarget(0);
        });
      }
    },
  };
}

function seedPositions(nodes: GraphNodeDatum[]): void {
  const posts = nodes.filter((node) => node.type === 'post');
  if (posts.length === 1 && nodes.length > 1) {
    posts[0]!.x = WIDTH / 2;
    posts[0]!.y = HEIGHT / 2;
    const ring = nodes.filter((node) => node !== posts[0]);
    ring.forEach((node, index) => {
      const angle = (index / Math.max(ring.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const radius = Math.min(320, 150 + ring.length * 18);
      node.x = WIDTH / 2 + Math.cos(angle) * radius;
      node.y = HEIGHT / 2 + Math.sin(angle) * radius;
    });
    return;
  }

  nodes.forEach((node, index) => {
    const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const radius = Math.min(330, 170 + nodes.length * 12);
    node.x = WIDTH / 2 + Math.cos(angle) * radius;
    node.y = HEIGHT / 2 + Math.sin(angle) * radius;
  });
}

function resolveNode(value: string | GraphNodeDatum, nodeById: Map<string, GraphNodeDatum>): GraphNodeDatum | undefined {
  return typeof value === 'string' ? nodeById.get(value) : value;
}

function createSvg(tag: string): SVGElement {
  return document.createElementNS(SVG_NS, tag);
}

function clipLabel(label: string): string {
  return label.length > 16 ? `${label.slice(0, 16)}...` : label;
}

function toSvgPoint(svg: SVGSVGElement, event: PointerEvent): DOMPoint {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = svg.getScreenCTM();
  return matrix ? point.matrixTransform(matrix.inverse()) : new DOMPoint(event.clientX, event.clientY);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
