import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiRequestError } from "@carekind/shared/api-client";
import { isUnauthenticated } from "./errors.tsx";

// 查询键集中在这里，失效（invalidate）时不会拼错。
export const queryKeys = {
	currentUser: ["auth", "me"],
	providers: ["providers"],
	provider: (providerId: string): readonly string[] => ["providers", providerId],
	facilities: (providerId: string): readonly string[] => ["providers", providerId, "facilities"],
	auditEvents: ["audit-events"],
} as const;

/** 4xx 和 501 重试也不会变，只重试网络错误和 5xx（501 除外），最多 1 次。 */
function shouldRetry(failureCount: number, error: unknown): boolean {
	if (failureCount >= 1) return false;
	if (!(error instanceof ApiRequestError)) return true;
	return error.status >= 500 && error.status !== 501;
}

/**
 * 任何请求在刷新 token 之后仍然 401，说明会话已结束：把当前用户设为 null，
 * RequireAuth 会跳回登录页（PRD §4-N：空闲超时后重新登录）。
 */
export function createQueryClient(): QueryClient {
	const queryClient: QueryClient = new QueryClient({
		queryCache: new QueryCache({ onError: handleSessionEnd }),
		mutationCache: new MutationCache({ onError: handleSessionEnd }),
		defaultOptions: {
			queries: { retry: shouldRetry, refetchOnWindowFocus: false, staleTime: 30_000 },
			mutations: { retry: false },
		},
	});
	function handleSessionEnd(error: unknown): void {
		if (isUnauthenticated(error)) queryClient.setQueryData(queryKeys.currentUser, null);
	}
	return queryClient;
}
