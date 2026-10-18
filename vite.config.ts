import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// 为什么用同源代理：API 的 cookie 是 httpOnly + SameSite=Strict（ADR-0006），
// 浏览器只在同源请求里带上它。/api 去掉前缀后转发给 carekind-api（默认 http://localhost:3100）。
// API 把 refresh cookie 的 path 设成 /auth/super-admin；经过代理后浏览器看到的路径是 /api/auth/super-admin，
// 所以要改写 cookie path，否则刷新 token 时浏览器不会带上 refresh cookie。

const DEV_PORT = 5174;
const DEFAULT_API_TARGET = "http://localhost:3100";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const apiTarget = env.API_PROXY_TARGET || DEFAULT_API_TARGET;
	return {
		plugins: [react()],
		resolve: {
			// @carekind/shared 是本地路径依赖，它的 devDependencies 里也有 React；强制只用本 app 的一份，避免 hooks 报错。
			dedupe: ["react", "react-dom", "@tanstack/react-query"],
		},
		server: {
			port: DEV_PORT,
			strictPort: true,
			fs: { allow: [".", "../shared"] },
			proxy: {
				"/api": {
					target: apiTarget,
					rewrite: (path: string) => path.replace(/^\/api/, ""),
					cookiePathRewrite: { "/auth/super-admin": "/api/auth/super-admin", "/": "/" },
				},
			},
		},
		test: {
			environment: "jsdom",
			include: ["src/**/*.test.{ts,tsx}"],
		},
	};
});
