import { useState, type FormEvent, type ReactElement } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { superAdminEndpoints } from "@carekind/shared/contracts";
import { Button, Card, PageHeader, TextInput, useToast } from "@carekind/shared/ui";
import { superAdminApi } from "../app/api.ts";
import { ErrorAlert } from "../app/errors.tsx";
import { toFieldErrors, type FieldErrors } from "../app/form-errors.ts";
import { queryKeys } from "../app/query-client.ts";

// 新建 Provider（状态 Draft）。校验用契约的 body schema；ABN 格式、名称唯一由 API 再校验一次。

type ProviderField = "legalName" | "tradingName" | "abn";

const FIELD_MESSAGES: Readonly<Record<ProviderField, string>> = {
	legalName: "Enter the provider's legal name, as shown on the ABN register.",
	tradingName: "Keep the trading name under 200 characters, or leave it blank.",
	abn: "Enter the 11-digit ABN. Spaces are fine.",
};

export function NewProviderPage(): ReactElement {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { showToast } = useToast();
	const [legalName, setLegalName] = useState("");
	const [tradingName, setTradingName] = useState("");
	const [abn, setAbn] = useState("");
	const [fieldErrors, setFieldErrors] = useState<FieldErrors<ProviderField>>({});

	const createProvider = useMutation({
		mutationFn: superAdminApi.createProvider,
		onSuccess: (provider) => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.providers });
			showToast({ variant: "success", title: `${provider.legalName} created as Draft` });
			navigate(`/providers/${provider.id}`);
		},
	});

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		const parsed = superAdminEndpoints.createProvider.body.safeParse({
			legalName: legalName.trim(),
			tradingName: tradingName.trim() === "" ? null : tradingName.trim(),
			abn,
		});
		if (!parsed.success) {
			setFieldErrors(toFieldErrors(parsed, FIELD_MESSAGES));
			return;
		}
		setFieldErrors({});
		createProvider.mutate({ body: parsed.data });
	}

	return (
		<div className="sa-stack">
			<PageHeader
				artwork="connections"
				breadcrumb={
					<nav className="ck-breadcrumb" aria-label="Breadcrumb">
						<ol>
							<li>
								<Link to="/providers">Providers</Link>
							</li>
							<li aria-current="page">New provider</li>
						</ol>
					</nav>
				}
				title="New provider"
				description="Create an organisation first, then add its facilities."
			/>
			<div className="sa-form-layout">
				<aside className="sa-form-intro">
					<h2>Organisation details</h2>
					<p>Use the legal name and ABN registered for this provider.</p>
					<p className="sa-muted">New providers start as Draft.</p>
				</aside>
				<Card>
					<form className="sa-form" onSubmit={handleSubmit} noValidate>
						{createProvider.isError ? (
							<ErrorAlert error={createProvider.error} title="Couldn't create the provider" />
						) : null}
						<TextInput
							label="Legal name"
							value={legalName}
							error={fieldErrors.legalName}
							onChange={(event) => setLegalName(event.target.value)}
						/>
						<TextInput
							label="Trading name"
							isOptional
							value={tradingName}
							error={fieldErrors.tradingName}
							onChange={(event) => setTradingName(event.target.value)}
						/>
						<TextInput
							label="ABN"
							inputMode="numeric"
							hint="11 digits, for example 12 345 678 901"
							value={abn}
							error={fieldErrors.abn}
							onChange={(event) => setAbn(event.target.value)}
						/>
						<div className="sa-actions">
							<Button
								type="submit"
								variant="primary"
								isLoading={createProvider.isPending}
								loadingText="Creating…"
							>
								Create provider
							</Button>
							<Button type="button" variant="text" onClick={() => navigate("/providers")}>
								Cancel
							</Button>
						</div>
					</form>
				</Card>
			</div>
		</div>
	);
}
