import type { ReactElement } from "react";
import { useNavigate } from "react-router";
import { Button, EmptyState } from "@carekind/shared/ui";

export function NotFoundPage(): ReactElement {
	const navigate = useNavigate();
	return (
		<EmptyState
			title="Page not found"
			body="This page doesn't exist in Super Admin."
			action={<Button onClick={() => navigate("/providers")}>Go to providers</Button>}
		/>
	);
}
