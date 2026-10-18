import type { ReactElement } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import type { SuperAdminPermission, SuperAdminPermissionGroup } from "@carekind/shared/schemas";
import { AppShell, useToast, type NavItem, type ShellBanner } from "@carekind/shared/ui";
import logoBlackUrl from "@carekind/shared/brand/carekind-logo-black.svg";
import { LOGIN_PATH, useCurrentUser, useSignOut } from "./auth.tsx";
import { describeError } from "./errors.tsx";

// 平台层外壳：顶栏写 "careKind platform"（Super Admin 不属于任何租户）。
// 没有权限的导航项直接不显示（AppShell 规则），API 仍然会再校验一次。

const GROUP_LABELS: Readonly<Record<SuperAdminPermissionGroup, string>> = {
	PlatformOwner: "Platform Owner",
	Onboarding: "Implementation",
	ContentGovernance: "Content & Clinical Governance",
	Support: "Support",
	Commercial: "Commercial",
	EngineerOnCall: "Engineer on-call",
	ReadOnlyAuditor: "Security Auditor",
};

interface NavDefinition {
	href: string;
	label: string;
	permission: SuperAdminPermission;
}

const NAV_DEFINITIONS: readonly NavDefinition[] = [
	{ href: "/providers", label: "Providers", permission: "providers.read" },
	{ href: "/audit-log", label: "Audit log", permission: "audit.read" },
];

const DEMO_BANNER_TEXT = "Demo console — fictional providers only. Nothing here affects real customers.";

export function SuperAdminShell(): ReactElement {
	const user = useCurrentUser();
	const location = useLocation();
	const navigate = useNavigate();
	const signOut = useSignOut();
	const { showToast } = useToast();

	function handleSignOut(): void {
		void signOut()
			.catch((error: unknown) => {
				showToast({
					variant: "warning",
					title: "Signed out on this device",
					description: describeError(error),
				});
			})
			.finally(() => navigate(LOGIN_PATH, { replace: true }));
	}

	const navItems: NavItem[] = NAV_DEFINITIONS.filter((item) => user.permissions.includes(item.permission)).map(
		(item) => ({ href: item.href, label: item.label, isCurrent: location.pathname.startsWith(item.href) }),
	);
	const banner: ShellBanner | undefined = user.isDemo
		? { kind: "demo", text: DEMO_BANNER_TEXT, onExit: handleSignOut }
		: undefined;
	const roleText = user.groups.map((group) => GROUP_LABELS[group]).join(", ") || "No permission groups";

	return (
		<AppShell
			productName="careKind Super Admin"
			brand={
				<div className="sa-brand">
					<img src={logoBlackUrl} alt="careKind" width={160} height={36} />
					<span className="ck-tag">Super Admin</span>
				</div>
			}
			tenantName="careKind platform"
			navGroups={[{ items: navItems }]}
			onNavigate={(href) => navigate(href)}
			user={{ name: user.displayName, role: roleText, onSignOut: handleSignOut }}
			banner={banner}
		>
			<Outlet />
		</AppShell>
	);
}
