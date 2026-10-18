import { useState, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import type { EndpointOutput } from "@carekind/shared/api-client";
import type { superAdminEndpoints } from "@carekind/shared/contracts";
import { formatDateAu } from "@carekind/shared/format";
import { Card, PageHeader, Spinner, Tabs } from "@carekind/shared/ui";
import { superAdminApi } from "../app/api.ts";
import { ErrorAlert } from "../app/errors.tsx";
import { queryKeys } from "../app/query-client.ts";
import { ProviderFacilitiesTab } from "./provider-facilities-tab.tsx";
import { ProviderStatusTag } from "./provider-status.tsx";

// Provider 详情：Overview（基本信息和计数）+ Facilities（代建 Facility）。
// 只显示计数，不显示住户或员工名单（Super Admin PRD §4-B）。

type ProviderSummary = EndpointOutput<typeof superAdminEndpoints.getProvider>;

function formatAbn(abn: string): string {
	return `${abn.slice(0, 2)} ${abn.slice(2, 5)} ${abn.slice(5, 8)} ${abn.slice(8)}`;
}

function OverviewTab({ provider }: { provider: ProviderSummary }): ReactElement {
	return (
		<div className="sa-columns">
			<Card title="Organisation">
				<dl className="sa-details">
					<dt>Legal name</dt>
					<dd>{provider.legalName}</dd>
					<dt>Trading name</dt>
					<dd>{provider.tradingName ?? "Not recorded"}</dd>
					<dt>ABN</dt>
					<dd>{formatAbn(provider.abn)}</dd>
					<dt>Status</dt>
					<dd>
						<ProviderStatusTag status={provider.status} />
					</dd>
					<dt>Created</dt>
					<dd>{formatDateAu(provider.createdAt)}</dd>
					<dt>Last updated</dt>
					<dd>{formatDateAu(provider.updatedAt)}</dd>
				</dl>
			</Card>
			<Card title="Counts">
				<dl className="sa-details">
					<dt>Facilities</dt>
					<dd>{provider.facilityCount}</dd>
					<dt>Staff accounts</dt>
					<dd>{provider.staffAccountCount}</dd>
					<dt>Residents</dt>
					<dd>{provider.residentCount}</dd>
				</dl>
				<p className="sa-muted">Counts only. Super Admin never shows resident names or records.</p>
			</Card>
		</div>
	);
}

export function ProviderDetailPage(): ReactElement {
	const { providerId = "" } = useParams();
	const [selectedTab, setSelectedTab] = useState("overview");
	const provider = useQuery({
		queryKey: queryKeys.provider(providerId),
		queryFn: () => superAdminApi.getProvider({ params: { providerId } }),
	});

	if (provider.isPending) return <Spinner label="Loading provider" />;
	if (provider.isError) return <ErrorAlert error={provider.error} title="Couldn't load this provider" />;

	return (
		<div className="sa-stack">
			<PageHeader
				title={provider.data.legalName}
				description={provider.data.isDemo ? "Fictional demo provider." : undefined}
				meta={<ProviderStatusTag status={provider.data.status} />}
			/>
			<Tabs
				label="Provider sections"
				selectedId={selectedTab}
				onSelect={setSelectedTab}
				tabs={[
					{ id: "overview", label: "Overview", panel: <OverviewTab provider={provider.data} /> },
					{
						id: "facilities",
						label: "Facilities",
						panel: <ProviderFacilitiesTab providerId={providerId} />,
					},
				]}
			/>
		</div>
	);
}
