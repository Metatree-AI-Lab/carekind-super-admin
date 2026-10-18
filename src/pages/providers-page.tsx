import { useMemo, useState, type MouseEvent, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import type { EndpointOutput } from "@carekind/shared/api-client";
import type { superAdminEndpoints } from "@carekind/shared/contracts";
import { formatDateAu } from "@carekind/shared/format";
import {
	Button,
	DataTable,
	EmptyState,
	PageHeader,
	TextInput,
	type TableColumn,
	type TableSort,
} from "@carekind/shared/ui";
import { superAdminApi } from "../app/api.ts";
import { useCurrentUser } from "../app/auth.tsx";
import { describeError, ErrorAlert, isNotImplemented } from "../app/errors.tsx";
import { queryKeys } from "../app/query-client.ts";
import { ProviderStatusTag } from "./provider-status.tsx";

// Provider 列表：名称筛选和排序在前端做（第一阶段 Provider 数量很少，一次取 200 条以内）。
// 只显示计数，不显示住户信息（Super Admin PRD §4-B）。

type ProviderRow = EndpointOutput<typeof superAdminEndpoints.listProviders>["items"][number];

const PAGE_LIMIT = 200;

function compareRows(left: ProviderRow, right: ProviderRow, sort: TableSort): number {
	const direction = sort.direction === "ascending" ? 1 : -1;
	if (sort.columnKey === "facilities") return (left.facilityCount - right.facilityCount) * direction;
	if (sort.columnKey === "created") return left.createdAt.localeCompare(right.createdAt) * direction;
	return left.legalName.localeCompare(right.legalName, "en-AU") * direction;
}

function ProviderNameLink({ row }: { row: ProviderRow }): ReactElement {
	const navigate = useNavigate();
	const href = `/providers/${row.id}`;
	function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
		event.preventDefault();
		navigate(href);
	}
	return (
		<a className="ck-link" href={href} onClick={handleClick}>
			{row.legalName}
		</a>
	);
}

const COLUMNS: readonly TableColumn<ProviderRow>[] = [
	{ key: "name", header: "Provider", isSortable: true, render: (row) => <ProviderNameLink row={row} /> },
	{ key: "status", header: "Status", render: (row) => <ProviderStatusTag status={row.status} /> },
	{ key: "facilities", header: "Facilities", isSortable: true, isNumeric: true, render: (row) => row.facilityCount },
	{ key: "created", header: "Created", isSortable: true, render: (row) => formatDateAu(row.createdAt) },
];

export function ProvidersPage(): ReactElement {
	const navigate = useNavigate();
	const user = useCurrentUser();
	const canCreate = user.permissions.includes("providers.write");
	const [nameFilter, setNameFilter] = useState("");
	const [sort, setSort] = useState<TableSort>({ columnKey: "name", direction: "ascending" });
	const providers = useQuery({
		queryKey: queryKeys.providers,
		queryFn: () => superAdminApi.listProviders({ query: { limit: PAGE_LIMIT } }),
	});

	const visibleRows = useMemo(() => {
		const needle = nameFilter.trim().toLocaleLowerCase("en-AU");
		const rows = (providers.data?.items ?? []).filter((row) =>
			`${row.legalName} ${row.tradingName ?? ""}`.toLocaleLowerCase("en-AU").includes(needle),
		);
		return [...rows].sort((left, right) => compareRows(left, right, sort));
	}, [providers.data, nameFilter, sort]);

	const status = providers.isPending ? "loading" : providers.isError ? "error" : "ready";
	const createButton = canCreate ? (
		<Button variant="primary" onClick={() => navigate("/providers/new")}>
			New provider
		</Button>
	) : undefined;

	if (isNotImplemented(providers.error))
		return <ErrorAlert error={providers.error} title="Couldn't load providers" />;

	return (
		<div className="sa-stack">
			<PageHeader
				title="Providers"
				description="Every aged care provider organisation on careKind. Resident information is never shown here."
				actions={createButton}
			/>
			<DataTable
				caption="Providers"
				noun="providers"
				columns={COLUMNS}
				rows={visibleRows}
				getRowKey={(row) => row.id}
				status={status}
				sort={sort}
				onSortChange={setSort}
				filters={
					<TextInput
						label="Search by provider name"
						isLabelHidden
						type="search"
						placeholder="Search by provider name"
						value={nameFilter}
						onChange={(event) => setNameFilter(event.target.value)}
					/>
				}
				hasActiveFilters={nameFilter.trim() !== ""}
				onClearFilters={() => setNameFilter("")}
				resultCountText={status === "ready" ? `${visibleRows.length} providers` : undefined}
				errorMessage={providers.isError ? describeError(providers.error) : undefined}
				onRetry={() => void providers.refetch()}
				emptyState={
					<EmptyState
						title="No providers yet"
						body="Create the first provider to start onboarding a customer."
						headingLevel={3}
						action={createButton}
					/>
				}
			/>
		</div>
	);
}
