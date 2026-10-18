import { useState, type FormEvent, type ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EndpointOutput } from "@carekind/shared/api-client";
import { superAdminEndpoints } from "@carekind/shared/contracts";
import { AUSTRALIAN_STATES } from "@carekind/shared/schemas";
import {
	Alert,
	Button,
	Card,
	Checkbox,
	EmptyState,
	Select,
	Spinner,
	Table,
	Tag,
	TextInput,
	type TableColumn,
} from "@carekind/shared/ui";
import { superAdminApi } from "../app/api.ts";
import { ErrorAlert } from "../app/errors.tsx";
import { toFieldErrors, type FieldErrors } from "../app/form-errors.ts";
import { queryKeys } from "../app/query-client.ts";

// 代建 Facility：州决定自动绑定的州规则包，之后改州只能走 four-eyes（PRD §4-B），所以表单上写明。

type FacilityRow = EndpointOutput<typeof superAdminEndpoints.listFacilities>[number];
type FacilityPreview = EndpointOutput<typeof superAdminEndpoints.createFacility>;
type FacilityField =
	| "name"
	| "address.line1"
	| "address.line2"
	| "address.suburb"
	| "address.state"
	| "address.postcode"
	| "operationalBeds";

const FIELD_MESSAGES: Readonly<Record<FacilityField, string>> = {
	name: "Enter the facility name.",
	"address.line1": "Enter the street address.",
	"address.line2": "Keep this line under 200 characters, or leave it blank.",
	"address.suburb": "Enter the suburb or town.",
	"address.state": "Choose the state or territory.",
	"address.postcode": "Enter the 4-digit postcode.",
	operationalBeds: "Enter the number of operational beds as a whole number.",
};

const STATE_OPTIONS = [
	{ value: "", label: "Choose a state or territory" },
	...AUSTRALIAN_STATES.map((state) => ({ value: state, label: state })),
];

const COLUMNS: readonly TableColumn<FacilityRow>[] = [
	{ key: "name", header: "Facility", render: (row) => row.name },
	{ key: "state", header: "State", render: (row) => row.address.state },
	{
		key: "status",
		header: "Status",
		render: (row) => (
			<Tag hasDot variant={row.status === "Active" ? "success" : "neutral"}>
				{row.status}
			</Tag>
		),
	},
	{ key: "rulePack", header: "Rule pack", render: (row) => row.rulePackId ?? "Not bound yet" },
	{ key: "goLive", header: "Go-live checklist", render: (row) => `${row.goLiveCompleted} of ${row.goLiveTotal}` },
	{ key: "beds", header: "Beds", isNumeric: true, render: (row) => row.operationalBeds },
];

function FacilityList({ providerId }: { providerId: string }): ReactElement {
	const facilities = useQuery({
		queryKey: queryKeys.facilities(providerId),
		queryFn: () => superAdminApi.listFacilities({ params: { providerId } }),
	});
	if (facilities.isPending) return <Spinner label="Loading facilities" />;
	if (facilities.isError) return <ErrorAlert error={facilities.error} title="Couldn't load facilities" />;
	if (facilities.data.length === 0) {
		return <EmptyState title="No facilities yet" body="Add the first facility below." headingLevel={3} />;
	}
	return <Table caption="Facilities" columns={COLUMNS} rows={facilities.data} getRowKey={(row) => row.id} />;
}

function CreatedNotice({ preview }: { preview: FacilityPreview }): ReactElement {
	return (
		<Alert variant="success" title={`${preview.facility.name} added`} isAnnounced>
			<p>
				Rule pack: {preview.boundRulePackId ?? "none published for this state yet"}. Templates enabled:{" "}
				{preview.enabledTemplateNames.length > 0 ? preview.enabledTemplateNames.join(", ") : "none yet"}.
			</p>
		</Alert>
	);
}

function CreateFacilityForm({ providerId }: { providerId: string }): ReactElement {
	const queryClient = useQueryClient();
	const [form, setForm] = useState({ name: "", line1: "", line2: "", suburb: "", state: "", postcode: "", beds: "" });
	const [isStateRun, setIsStateRun] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors<FacilityField>>({});
	const createFacility = useMutation({
		mutationFn: superAdminApi.createFacility,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.facilities(providerId) });
			void queryClient.invalidateQueries({ queryKey: queryKeys.provider(providerId) });
			setForm({ name: "", line1: "", line2: "", suburb: "", state: "", postcode: "", beds: "" });
			setIsStateRun(false);
		},
	});

	function update(field: keyof typeof form): (value: string) => void {
		return (value) => setForm((current) => ({ ...current, [field]: value }));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		const parsed = superAdminEndpoints.createFacility.body.safeParse({
			name: form.name.trim(),
			regionId: null,
			address: {
				line1: form.line1.trim(),
				line2: form.line2.trim() === "" ? null : form.line2.trim(),
				suburb: form.suburb.trim(),
				state: form.state,
				postcode: form.postcode.trim(),
			},
			isStateGovernmentOperated: isStateRun,
			operationalBeds: form.beds.trim() === "" ? Number.NaN : Number(form.beds),
		});
		if (!parsed.success) {
			setFieldErrors(toFieldErrors(parsed, FIELD_MESSAGES));
			return;
		}
		setFieldErrors({});
		createFacility.mutate({ params: { providerId }, body: parsed.data });
	}

	return (
		<form className="sa-form" onSubmit={handleSubmit} noValidate>
			{createFacility.isError ? (
				<ErrorAlert error={createFacility.error} title="Couldn't add the facility" />
			) : null}
			{createFacility.isSuccess ? <CreatedNotice preview={createFacility.data} /> : null}
			<TextInput
				label="Facility name"
				value={form.name}
				error={fieldErrors.name}
				onChange={(e) => update("name")(e.target.value)}
			/>
			<TextInput
				label="Street address"
				value={form.line1}
				error={fieldErrors["address.line1"]}
				onChange={(e) => update("line1")(e.target.value)}
			/>
			<TextInput
				label="Address line 2"
				isOptional
				value={form.line2}
				error={fieldErrors["address.line2"]}
				onChange={(e) => update("line2")(e.target.value)}
			/>
			<TextInput
				label="Suburb"
				value={form.suburb}
				error={fieldErrors["address.suburb"]}
				onChange={(e) => update("suburb")(e.target.value)}
			/>
			<Select
				label="State or territory"
				hint="Sets the state rule pack. Changing it later needs a second approver."
				options={STATE_OPTIONS}
				value={form.state}
				error={fieldErrors["address.state"]}
				onChange={(e) => update("state")(e.target.value)}
			/>
			<TextInput
				label="Postcode"
				inputMode="numeric"
				value={form.postcode}
				error={fieldErrors["address.postcode"]}
				onChange={(e) => update("postcode")(e.target.value)}
			/>
			<TextInput
				label="Operational beds"
				inputMode="numeric"
				value={form.beds}
				error={fieldErrors.operationalBeds}
				onChange={(e) => update("beds")(e.target.value)}
			/>
			<Checkbox
				label="State government operated"
				checked={isStateRun}
				onChange={(e) => setIsStateRun(e.target.checked)}
			/>
			<div className="sa-actions">
				<Button type="submit" variant="primary" isLoading={createFacility.isPending} loadingText="Adding…">
					Add facility
				</Button>
			</div>
		</form>
	);
}

export function ProviderFacilitiesTab({ providerId }: { providerId: string }): ReactElement {
	return (
		<div className="sa-stack">
			<FacilityList providerId={providerId} />
			<div className="sa-form-layout">
				<aside className="sa-form-intro">
					<h2>Add a facility</h2>
					<p>Set up an aged care location for this provider.</p>
					<p className="sa-muted">The state determines the initial rule pack.</p>
				</aside>
				<Card title="Facility details">
					<CreateFacilityForm providerId={providerId} />
				</Card>
			</div>
		</div>
	);
}
