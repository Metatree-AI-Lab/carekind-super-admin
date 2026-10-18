import type { ReactElement } from "react";
import { useNavigate } from "react-router";
import { Button, EmptyState, PageHeader } from "@carekind/shared/ui";

export function NotFoundPage(): ReactElement {
	const navigate = useNavigate();
	return (
		<div className="sa-stack">
			<PageHeader artwork="care" title="Page not found" description="This page does not exist in Super Admin." />
			<EmptyState
				title="Return to your workspace"
				body="Use the navigation to choose a page, or return to providers."
				action={<Button onClick={() => navigate("/providers")}>Go to providers</Button>}
			/>
		</div>
	);
}
