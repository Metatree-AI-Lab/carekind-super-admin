# CLAUDE.md — src/app（应用骨架）

> 层级：功能模块 · 路径：`06-app-development/super-admin/src/app/` · 上级上下文：[`../CLAUDE.md`](../CLAUDE.md)

## 这里是什么
路由、登录状态、API 客户端、React Query 配置、错误显示、AppShell 外壳。

## 关键文件
| 文件 | 内容 |
|---|---|
| `api.ts` | `authApi`、`superAdminApi`（shared 的 `bindEndpoints`）；`createRefreshingFetch`：401 时用 refresh cookie 轮换一次再重发 |
| `auth.tsx` | `useCurrentUserQuery`（`/auth/super-admin/me`，401 = 未登录）、`RequireAuth`（未登录跳 `/login` 并记住原地址）、`useCurrentUser`、`signOut` |
| `query-client.ts` | `queryKeys`；`createQueryClient`：刷新后仍 401 就把当前用户设为 null（回到登录页）；4xx / 501 不重试 |
| `errors.tsx` | `isNotImplemented`（501）、`ErrorAlert`：501 显示 "Not available in this build"，不假装成功 |
| `form-errors.ts` | `toFieldErrors`：契约 zod schema 的校验问题 → 字段提示（文案由页面给，澳式英语） |
| `router.tsx` | 路由表；除 `/login` 外都在 `RequireAuth` + `SuperAdminShell` 里 |
| `shell.tsx` | AppShell：导航按权限显示（Providers、Audit log）；顶栏 "careKind platform"、当前用户、Sign out；Demo 会话显示不可关闭的横幅 |

## 规则
- token 只在 httpOnly cookie 里，前端不读、不存（不用 localStorage）。
- 导航项按 `user.permissions` 过滤；API 仍会再校验。
- 新端点调用一律通过 `superAdminApi`，不要直接 fetch。

## 测试与验收
第一阶段按 owner 指示暂不写测试。待补：未登录重定向（`RequireAuth`）、501 显示（`ErrorAlert`）。

## 不要做
- 不要做 MFA；不要把 token 放进 JS 可读的位置。
