# carekind-super-admin

careKind AI — Super Admin。careKind 内部员工用的跨租户管理控制台。默认看不到任何住户健康信息。

- 技术栈：React 19 + Vite 7 + TypeScript（strict）+ React Router 7 + TanStack Query 5（ADR-0006）
- 组件、类型、校验、API 客户端都来自 `@carekind/shared`（`file:../shared`）
- 本 repo 是 [`Metatree-AI-Lab/carekind`](https://github.com/Metatree-AI-Lab/carekind) 的 submodule（`06-app-development/super-admin/`）。**产品需求、设计、规则和所有文档都在 meta repo**。

## 第一阶段已有的页面
登录 · Providers 列表（搜索、排序）· 新建 Provider · Provider 详情（Overview、Facilities：代建 Facility）· Audit log。
暂不做（Lightman 18/10/2026）：Feature flags、Owner 邀请、暂停 / 恢复、Unit、审批队列。API 返回 501 的功能显示 "Not available in this build"。

## 本地运行
1. **先启动 API**（`../app`，按它的 README：Postgres、迁移、RLS、种子数据、启动）。API 默认端口 `3100`。
   本地 http 开发时建议在 API 的 `.env` 里设 `COOKIE_SECURE=false`。
2. 在本目录：
   ```bash
   npm install
   cp .env.example .env     # 可选；默认值就能用
   npm run dev
   ```
3. 打开 http://localhost:5174

**登录账号**：虚构的 Super Admin 账号由 API 种子数据创建，邮箱和密码就是 API `.env` 里的 `SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD`（第二位批准人：`SEED_SECOND_SUPER_ADMIN_EMAIL` / `SEED_SECOND_SUPER_ADMIN_PASSWORD`）。本 repo 不保存任何密码。

## 环境变量（`.env.example`）
| 变量 | 默认 | 说明 |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | 浏览器调用 API 的根路径。默认走 Vite 同源代理，httpOnly + SameSite=Strict cookie 才会被带上 |
| `API_PROXY_TARGET` | `http://localhost:3100` | dev server 把 `/api/*` 去掉前缀后转发到这里；同时把 refresh cookie 的 path `/auth/super-admin` 改写成 `/api/auth/super-admin` |

## 命令
```bash
npm run dev        # 本地开发（端口 5174）
npm run build      # 类型检查 + 构建（只在 GitHub Actions 云端运行，owner 全局规则）
npm test           # Vitest（同上，只在云端运行）
npm run lint       # ESLint（同上）
npm run format     # Prettier（Tab，宽度 4）
```

## 依赖与理由（最少依赖，rules/02 §11）
| 依赖 | 理由 |
|---|---|
| `@carekind/shared` | 契约、schema、API 客户端、组件库唯一来源 |
| `react`、`react-dom` | ADR-0005 / 0006 已定 React 19 |
| `react-router` | 客户端路由（ADR-0006） |
| `@tanstack/react-query` | 请求缓存、加载 / 错误状态、失效刷新（ADR-0006） |
| `vite`、`@vitejs/plugin-react`（dev） | 开发服务器和构建（ADR-0006） |
| `typescript`、`eslint`、`typescript-eslint`、`prettier`（dev） | 类型、lint、格式（与 shared 同版本） |
| `vitest`、`jsdom`、`@testing-library/react`、`@testing-library/dom`（dev） | 组件测试（第一阶段暂未写） |
