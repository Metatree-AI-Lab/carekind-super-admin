import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { ToastProvider } from "@carekind/shared/ui";
import "@carekind/shared/styles/tokens.css";
import "@carekind/shared/styles/components.css";
import "@carekind/shared/styles/editorial.css";
import "@carekind/shared/styles/decorations.css";
import "./app.css";
import { createQueryClient } from "./app/query-client.ts";
import { createAppRouter } from "./app/router.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('index.html is missing <div id="root">.');

const queryClient = createQueryClient();
const router = createAppRouter();

createRoot(rootElement).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ToastProvider>
				<RouterProvider router={router} />
			</ToastProvider>
		</QueryClientProvider>
	</StrictMode>,
);
