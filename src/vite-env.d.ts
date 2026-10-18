/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** API 根路径，默认 "/api"（Vite 同源代理）。 */
	readonly VITE_API_BASE_URL?: string;
}
