# CLAUDE.md — Super Admin（carekind-super-admin）

> 层级：代码仓库 · 本 repo 是 meta repo [`Metatree-AI-Lab/carekind`](https://github.com/Metatree-AI-Lab/carekind) 的 submodule，路径 `06-app-development/super-admin/`。
> 本文件给 AI 看；给人看的说明在同目录的 `README.md`。

## 这里是什么
careKind 内部员工用的跨租户管理与配置：Provider、养老院、州规则包、模板库、流程模板、功能开关。默认看不到任何住户健康信息。

技术栈：React + TypeScript。

## 本 repo 的规则
- **所有文档都在 meta repo**：PRD、ADR、架构、设计规范、文书模板、调研、changelog 都不放在这里。这里只放代码、测试、CI 配置。
- 写代码前先读 meta repo 的 `AGENTS.md`、`rules/02-code-rules.md`（Tab 缩进 4、单文件 ≤ 1000 行、禁用 any、只用合成测试数据）和 `docs/PRD.md` §9 护栏。
- 改完代码：先在本 repo 提交并推送，再回到 meta repo 提交 submodule 指针。
- 共用工具（`.editorconfig`、`scripts/check-*.sh`）以 meta repo 为准，由 meta repo 的 `scripts/sync-app-tooling.sh` 同步。
- 不在日志里记录音频、转写文本、住户姓名或任何健康信息。

## 相关
- meta repo `docs/prds/2026-10-18-super-admin-multi-facility-console.md`
- meta repo `06-app-development/engineering/adr/0005-polyrepo-and-mvp-tech-stack.md`（repo 结构与技术栈）
