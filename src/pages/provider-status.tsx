import type { ReactElement } from "react";
import type { ProviderStatus } from "@carekind/shared/schemas";
import { Tag, type StatusVariant } from "@carekind/shared/ui";

// 生命周期状态 → 标签颜色（只表示状态，不表示风险或评分）。
const STATUS_VARIANTS: Readonly<Record<ProviderStatus, StatusVariant>> = {
	Draft: "neutral",
	Onboarding: "info",
	Active: "success",
	Suspended: "warning",
	Terminating: "danger",
	Terminated: "neutral",
	Cancelled: "neutral",
};

export function ProviderStatusTag({ status }: { status: ProviderStatus }): ReactElement {
	return (
		<Tag variant={STATUS_VARIANTS[status]} hasDot>
			{status}
		</Tag>
	);
}
