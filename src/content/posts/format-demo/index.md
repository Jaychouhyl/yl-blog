---
title: 写作格式示例
date: 2026-06-09
tags: [量化, 笔记]
summary: 公式、代码块与排版元素的渲染演示，正式开张后可删除。
---

## 公式

夏普比率定义为：

$$
S = \frac{E[R_p - R_f]}{\sigma_p}
$$

其中 $\alpha + \beta = \gamma$ 是一个简单的行内公式示例。

## 代码

```python
def sharpe(returns, rf=0.0):
    excess = returns - rf
    return excess.mean() / excess.std()
```

> 引用块、**加粗**、*斜体*、[链接](https://astro.build) 一应俱全。
