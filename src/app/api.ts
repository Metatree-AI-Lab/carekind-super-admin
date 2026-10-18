import { bindEndpoints, createApiClient, type ApiClient, type BoundEndpoints } from "@carekind/shared/api-client";
import { authEndpoints, superAdminEndpoints } from "@carekind/shared/contracts";

// 唯一的 API 入口：类型、校验都来自 @carekind/shared 的契约，这里不写第二份。
// 默认走同源 /api（Vite 代理到 carekind-api），httpOnly cookie 才能被带上。

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "/api";
const REFRESH_PATH = authEndpoints.superAdminRefresh.path;

/** 认证端点本身不触发刷新（登录失败、刷新失败要直接交给调用方）。 */
function isAuthRequest(url: string): boolean {
	return url.startsWith(`${API_BASE_URL}/auth/`);
}

/**
 * access token 只有 15 分钟（ADR-0006）。为什么在 fetch 层处理：页面不用各自重试，
 * 收到 401 时先用 refresh cookie 轮换一次，成功就重发原请求；刷新失败就把原 401 交回去，由路由跳到登录。
 */
export function createRefreshingFetch(baseFetch: typeof fetch): typeof fetch {
	return async (input, init) => {
		const response = await baseFetch(input, init);
		const url = String(input);
		if (response.status !== 401 || isAuthRequest(url)) return response;
		const refresh = await baseFetch(`${API_BASE_URL}${REFRESH_PATH}`, {
			method: "POST",
			credentials: "include",
			headers: { Accept: "application/json", "Content-Type": "application/json" },
			body: "{}",
		});
		if (!refresh.ok) return response;
		return baseFetch(input, init);
	};
}

const client: ApiClient = createApiClient({
	baseUrl: API_BASE_URL,
	fetchImpl: createRefreshingFetch(globalThis.fetch.bind(globalThis)),
});

/** 登录、登出、当前用户。 */
export const authApi: BoundEndpoints<typeof authEndpoints> = bindEndpoints(client, authEndpoints);

/** `/super-admin/...` 端点。 */
export const superAdminApi: BoundEndpoints<typeof superAdminEndpoints> = bindEndpoints(client, superAdminEndpoints);
