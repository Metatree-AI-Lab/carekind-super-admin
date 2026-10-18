import type { ReactElement } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { AuditEvent } from "@carekind/shared/schemas";
import { formatDateTimeAu } from "@carekind/shared/format";
import { Button, DataTable, EmptyState, PageHeader, Tag, type TableColumn } from "@carekind/shared/ui";
import { superAdminApi } from "../app/api.ts";
import { describeError, ErrorAlert, isNotImplemented } from "../app/errors.tsx";
import { queryKeys } from "../app/query-client.ts";

// 审计日志只读、只追加。只显示 ID 和动作代码，不显示姓名、原因正文或健康信息（ADR-0006）。

const PAGE_LIMIT = 50;

const COLUMNS: readonly TableColumn<AuditEvent>[] = [
	{
		key: "time",
		header: "Time",
		render: (event) => (
			<time className="sa-audit-time" dateTime={event.occurredAt}>
				{formatDateTimeAu(event.occurredAt)
					.split(" ")
					.map((part) => (
						<span key={part}>{part}</span>
					))}
			</time>
		),
	},
	{ key: "actor", header: "Actor", render: (event) => `${event.actorType} · ${event.actorId ?? "system"}` },
	{ key: "action", header: "Action", render: (event) => <code className="sa-audit-action">{event.action}</code> },
	{
		key: "outcome",
		header: "Outcome",
		render: (event) => <Tag variant={event.outcome === "Succeeded" ? "success" : "warning"}>{event.outcome}</Tag>,
	},
	{ key: "targetType", header: "Object type", render: (event) => event.targetType },
	{ key: "targetId", header: "Object ID", render: (event) => <code>{event.targetId}</code> },
];

export function AuditLogPage(): ReactElement {
	const events = useInfiniteQuery({
		queryKey: queryKeys.auditEvents,
		initialPageParam: undefined as string | undefined,
		queryFn: ({ pageParam }) => superAdminApi.listAuditEvents({ query: { limit: PAGE_LIMIT, cursor: pageParam } }),
		getNextPageParam: (page) => page.nextCursor ?? undefined,
	});
	if (isNotImplemented(events.error)) return <ErrorAlert error={events.error} title="Couldn't load the audit log" />;

	const rows = events.data?.pages.flatMap((page) => page.items) ?? [];
	const status = events.isPending ? "loading" : events.isError ? "error" : "ready";
	return (
		<div className="sa-stack">
			<PageHeader
				artwork="notes"
				title="Audit log"
				description="A read-only record of platform activity. Times are Melbourne time."
			/>
			<DataTable
				caption="Audit events, newest first"
				noun="audit events"
				columns={COLUMNS}
				rows={rows}
				getRowKey={(event) => event.id}
				status={status}
				errorMessage={events.isError ? describeError(events.error) : undefined}
				onRetry={() => void events.refetch()}
				emptyState={<EmptyState title="No audit events yet" headingLevel={3} />}
			/>
			{events.hasNextPage ? (
				<div className="sa-actions">
					<Button
						onClick={() => void events.fetchNextPage()}
						isLoading={events.isFetchingNextPage}
						loadingText="Loading…"
					>
						Load more
					</Button>
				</div>
			) : null}
		</div>
	);
}
