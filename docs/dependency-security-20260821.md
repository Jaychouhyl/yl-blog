# 依赖安全扫描与最小修复记录

## 结论

2026-08-21 使用 OSV API 按 `package-lock.json` 中的 npm 包名和精确版本进行扫描。

- 修复前：485 个包版本组合，30 条安全公告。
- 最小锁文件更新后：485 个包版本组合，4 条安全公告。
- `package.json` 未修改，未进入 Astro 7 或 Sharp 0.35 大版本迁移。

## 本轮更新

| 包 | 原版本 | 更新版本 |
| --- | --- | --- |
| `@astrojs/rss` | `4.0.18` | `4.0.19` |
| `brace-expansion` | `5.0.6` | `5.0.9` |
| `fast-uri` | `3.1.2` | `3.1.5` |
| `js-yaml` | `4.2.0` | `4.3.1` |
| `nanoid` | `3.3.12` | `3.3.18` |
| `postcss` | `8.5.15` | `8.5.26` |
| `svgo` | `4.0.1` | `4.0.2` |
| `undici` | `7.27.2` | `7.29.0` |

## 第一阶段后剩余风险（已处理）

- `astro@6.4.6`：3 条 XSS 相关公告，OSV 标记的修复版本位于 Astro 7.x。
- `sharp@0.34.5`：1 条 libvips 相关公告，OSV 标记的修复版本位于 Sharp 0.35.x。

上述两项没有混入第一阶段锁文件修复，随后通过独立迁移完成处理。

## 第二阶段迁移

- `astro`：`6.4.6` 升级到 `7.2.4`。
- `sharp`：`0.34.5` 升级到 `0.35.3`。
- `vite`：随 Astro 升级从 `7.3.5` 更新到 `8.2.2`。
- `@astrojs/check`：`0.9.9` 升级到 `0.9.10`。
- 显式加入 `@astrojs/markdown-remark@7.2.4`，满足 Astro 7 的 peer dependency 和现有配置导入。
- 将 `@astrojs/rss` 的声明下限同步到修复版本 `4.0.19`。

迁移先在干净临时目录验证，再落到当前工作区。OSV 复扫覆盖 521 个包版本组合，结果为 0 条安全公告。

## 验证

- Vitest：47/47 通过。
- Astro check：0 errors、0 warnings、0 hints。
- Astro build：77 个页面构建成功。
- Pagefind：索引 74 个页面、2334 个词。
- OSV 复扫：30 条降至 4 条。

第二阶段迁移后：

- Vitest：47/47 通过。
- Astro check：0 errors、0 warnings、0 hints。
- Astro build：77 个页面构建成功。
- Pagefind：索引 74 个页面、2339 个词；新增 5 个词来自 SmartX flowchart 代码块的生成空白变化，文章正文未修改。
- Base-aware 静态检查：1396 条内部引用，0 个缺失目标，0 个裸 `/images/` 引用。
- Linkinator：在 `/yl-blog` 本地映射下通过内部页面、资源、CSS 和锚点检查。
- OSV 复扫：521 个包版本组合，0 条安全公告。
