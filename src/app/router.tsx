import type { ReactElement } from "react";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router";
import { AuditLogPage } from "../pages/audit-log-page.tsx";
import { LoginPage } from "../pages/login-page.tsx";
import { NewProviderPage } from "../pages/new-provider-page.tsx";
import { NotFoundPage } from "../pages/not-found-page.tsx";
import { ProviderDetailPage } from "../pages/provider-detail-page.tsx";
import { ProvidersPage } from "../pages/providers-page.tsx";
import { LOGIN_PATH, RequireAuth } from "./auth.tsx";
import { SuperAdminShell } from "./shell.tsx";

// 除登录页外，所有页面都在 RequireAuth 里面（默认需要登录，rules/02 §7）。

function ProtectedShell(): ReactElement {
	return (
		<RequireAuth>
			<SuperAdminShell />
		</RequireAuth>
	);
}

export const appRoutes: RouteObject[] = [
	{ path: LOGIN_PATH, element: <LoginPage /> },
	{
		path: "/",
		element: <ProtectedShell />,
		children: [
			{ index: true, element: <Navigate to="/providers" replace /> },
			{ path: "providers", element: <ProvidersPage /> },
			{ path: "providers/new", element: <NewProviderPage /> },
			{ path: "providers/:providerId", element: <ProviderDetailPage /> },
			{ path: "audit-log", element: <AuditLogPage /> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
];

export function createAppRouter(): ReturnType<typeof createBrowserRouter> {
	return createBrowserRouter(appRoutes);
}
