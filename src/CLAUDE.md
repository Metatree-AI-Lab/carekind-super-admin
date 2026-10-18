# CLAUDE.md — src（Super Admin 源代码）

> 层级：子部门 / 功能区 · 路径：`06-app-development/super-admin/src/` · 上级上下文：[`../CLAUDE.md`](../CLAUDE.md)
> 本文件给 AI 看；给人看的说明在同目录的 `README.md`。

## 这里是什么
Super Admin 前端源代码。`main.tsx` 入口（引入 shared 的 `tokens.css` → `components.css` → `app.css`），`app/` 放路由、认证、API 客户端、查询缓存，`pages/` 放页面。

## 规则
- 组件只用 `@carekind/shared/ui`；类型和校验只用 `@carekind/shared` 的 contracts / schemas，不自己再写一套。
- `app.css` 只放布局间距（`sa-` 前缀），只用 tokens 变量；不写颜色和像素，不重定义 `ck-` 组件。
- 目录保持浅：只有 `app/` 和 `pages/`。新目录必须同时建 README.md + CLAUDE.md + AGENTS.md 软链接。
- 不显示住户姓名或任何临床内容；Provider 只显示计数。
- 单文件目标 ≤ 500 行，Tab 缩进 4，无 any，导出写类型。

## 关键文件
- `main.tsx`、`app.css`、`vite-env.d.ts`
- `app/`（见其 CLAUDE.md）、`pages/`（见其 CLAUDE.md）

## 不要做
- 不要加护士端功能、MFA、住户查看界面。
- 不要引入 UI 库或 Tailwind（ADR-0006）。
