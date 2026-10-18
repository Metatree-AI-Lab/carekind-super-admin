import { createContext, useContext, type ReactElement, type ReactNode } from "react";
import { useQuery, useQueryClient, type QueryClient, type UseQueryResult } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router";
import type { SuperAdminCurrentUser } from "@carekind/shared/schemas";
import { Alert, Button, Spinner } from "@carekind/shared/ui";
import { authApi } from "./api.ts";
import { describeError, isUnauthenticated } from "./errors.tsx";
import { queryKeys } from "./query-client.ts";

// 登录状态的唯一来源是 GET /auth/super-admin/me（token 在 httpOnly cookie 里，前端读不到）。
// 401 → 未登录（null），不是错误；其他失败显示错误和重试，不当成已登录。

export const LOGIN_PATH: string = "/login";

/** 登录页从这里读回原来要去的地址。 */
export interface LoginRedirectState {
	from: string;
}

async function fetchCurrentUser(): Promise<SuperAdminCurrentUser | null> {
	try {
		return await authApi.superAdminMe({});
	} catch (error) {
		if (isUnauthenticated(error)) return null;
		throw error;
	}
}

export function useCurrentUserQuery(): UseQueryResult<SuperAdminCurrentUser | null> {
	return useQuery({ queryKey: queryKeys.currentUser, queryFn: fetchCurrentUser });
}

const CurrentUserContext = createContext<SuperAdminCurrentUser | null>(null);

/** 只能在 RequireAuth 里面用；外面调用说明路由写错了。 */
export function useCurrentUser(): SuperAdminCurrentUser {
	const user = useContext(CurrentUserContext);
	if (!user) throw new Error("useCurrentUser() must be used inside <RequireAuth>.");
	return user;
}

/** 已登录才渲染 children；未登录跳到登录页，并记住原来的地址。 */
export function RequireAuth({ children }: { children: ReactNode }): ReactElement {
	const location = useLocation();
	const currentUser = useCurrentUserQuery();
	if (currentUser.isPending) return <Spinner label="Checking your session" />;
	if (currentUser.isError) {
		return (
			<Alert variant="danger" title="Couldn't check your session" isAnnounced>
				<p>{describeError(currentUser.error)}</p>
				<Button onClick={() => void currentUser.refetch()}>Try again</Button>
			</Alert>
		);
	}
	if (!currentUser.data) {
		const state: LoginRedirectState = { from: `${location.pathname}${location.search}` };
		return <Navigate to={LOGIN_PATH} replace state={state} />;
	}
	return <CurrentUserContext.Provider value={currentUser.data}>{children}</CurrentUserContext.Provider>;
}

/** 登出：先撤销服务器上的 refresh token，再清空本地缓存（不留下上一个人的数据）。 */
export async function signOut(queryClient: QueryClient): Promise<void> {
	try {
		await authApi.superAdminLogout({});
	} finally {
		queryClient.clear();
		queryClient.setQueryData(queryKeys.currentUser, null);
	}
}

export function useSignOut(): () => Promise<void> {
	const queryClient = useQueryClient();
	return () => signOut(queryClient);
}
