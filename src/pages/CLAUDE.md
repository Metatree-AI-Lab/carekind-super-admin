# CLAUDE.md — src/pages（页面）

> 层级：功能模块 · 路径：`06-app-development/super-admin/src/pages/` · 上级上下文：[`../CLAUDE.md`](../CLAUDE.md)

## 这里是什么
Super Admin 第一阶段页面（Lightman 18/10/2026 缩小范围后）。

| 文件 | 页面 | API |
|---|---|---|
| `login-page.tsx` | 登录（super-admin audience） | `POST /auth/super-admin/login` |
| `providers-page.tsx` | Providers 列表：名称搜索、排序、loading / empty / error | `GET /super-admin/providers` |
| `new-provider-page.tsx` | 新建 Provider（Draft），契约 schema 校验 | `POST /super-admin/providers` |
| `provider-detail-page.tsx` | Provider 详情：Tabs = Overview、Facilities | `GET /super-admin/providers/:id` |
| `provider-facilities-tab.tsx` | Facility 列表 + 代建 Facility（州 Select，显示绑定的规则包） | `GET/POST /super-admin/providers/:id/facilities` |
| `audit-log-page.tsx` | 审计日志：时间 DD/MM/YYYY HH:mm、操作者、动作、结果、对象类型、对象 ID；Load more | `GET /super-admin/audit-events` |
| `provider-status.tsx` | 生命周期状态标签 | — |
| `not-found-page.tsx` | 404 | — |

## 规则
- 只用 `@carekind/shared/ui` 组件；表单校验用 `superAdminEndpoints.<name>.body.safeParse`。
- 错误用 `../app/errors.tsx` 的 `ErrorAlert`（501 → "Not available in this build"）。
- 不显示住户姓名、员工名单或临床内容；Provider 只显示计数。审计只显示 ID 和代码。
- 日期用 `@carekind/shared/format`。

## 暂不做（owner 指示）
Feature flags、Owner 邀请、暂停 / 恢复、Unit 代建、审批队列。

## 不要做
- 不要做排名、评分、风险色、趋势。

## 登录页视觉验收（18/10/2026）
- Owner: Lightman · Status: Local revision · Last reviewed: 18/10/2026
- `LoginPage(): ReactElement`：居中内部登录表单；保留 schema 校验、super-admin audience 和成功跳转，不新增权限。
- 认证表单只设一个提交入口；控件复用 shared。截图与限制见 meta repo `06-app-development/design/login-review-2026-10-18.md`。

## 后台视觉统一（18/10/2026）

Owner: Lightman · Status: Local revision · Last reviewed: 18/10/2026

登录后 Providers、Overview、Facilities、New provider、Audit log、404 共用工作层标题和间距。深层页面使用 Breadcrumb；新建表单为说明 + Card，仍只有一个 submit。`OverviewTab` 展示 API 返回计数，不推算结果。手机表格由共享 Table / DataTable 回流。

## 图片与动效（18/10/2026）
Owner: Lightman · Status: Local revision · Last reviewed: 18/10/2026

LoginPage 增加品牌插画面板，手机为紧凑图文条；Providers / Detail / New provider / Audit log / 404 的 PageHeader 传入插画主题。仅视觉变化，不变更认证、权限、数据或提交动作。
