# CLAUDE.md — Super Admin（carekind-super-admin）

> 层级：代码仓库 · 本 repo 是 meta repo [`Metatree-AI-Lab/carekind`](https://github.com/Metatree-AI-Lab/carekind) 的 submodule，路径 `06-app-development/super-admin/`。
> 本文件给 AI 看；给人看的说明在同目录的 `README.md`。

## 这里是什么
careKind 内部员工用的跨租户管理控制台。默认看不到任何住户健康信息。React 19 + Vite 7 + TypeScript strict + React Router 7 + TanStack Query 5（ADR-0006）。组件、类型、校验、API 客户端全部来自 `@carekind/shared`（`file:../shared`）。

## 本地运行
先起 API（`../app`，默认 `http://localhost:3100`）→ `npm install` → `npm run dev` → 打开 http://localhost:5174。
Vite 把 `/api/*` 代理到 `API_PROXY_TARGET`（去掉 `/api` 前缀，并把 refresh cookie path 改写成 `/api/auth/super-admin`）。
登录用 API 种子数据里的虚构账号：API `.env` 的 `SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD`。

## 目录
`src/main.tsx` 入口 · `src/app/` 路由、认证、API 客户端、查询缓存、错误显示 · `src/pages/` 页面。各目录有自己的 CLAUDE.md。

## 本 repo 的规则
- **所有文档都在 meta repo**：PRD、ADR、设计规范、changelog 不放在这里。这里只放代码、测试、CI 配置和三件套说明文件。
- 写代码前先读 meta repo 的 `AGENTS.md`、`rules/02-code-rules.md`、`docs/PRD.md` §9 护栏、`docs/prds/2026-10-18-super-admin-multi-facility-console.md`。
- 只用 `ck-` 组件和 tokens；不引入 UI 库；`src/app.css` 只放 `sa-` 布局间距。
- 每个目录都要有 README.md + CLAUDE.md + AGENTS.md（软链接）；目录保持浅；不要生成 `dist/`、`coverage/`。
- 本机只允许运行自己新写的个别测试文件；全量 build / typecheck / lint / test 只在 GitHub Actions（owner 全局规则）。
- 改完代码：先在本 repo 提交并推送，再回到 meta repo 提交 submodule 指针（只在 owner 要求提交时做）。
- 不在日志或界面显示住户姓名或任何健康信息；没有 MFA（ADR-0005）。

## 相关
- meta repo `docs/prds/2026-10-18-super-admin-multi-facility-console.md`
- meta repo `06-app-development/engineering/adr/0005-polyrepo-and-mvp-tech-stack.md`、`0006-phase1-admin-implementation-defaults.md`
