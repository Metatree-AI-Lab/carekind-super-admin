import type { ReactElement } from "react";
import { ApiRequestError } from "@carekind/shared/api-client";
import { Alert } from "@carekind/shared/ui";

// API 第一阶段只实现了部分 Super Admin 端点，其余返回 501。
// 页面遇到 501 必须明确说"这个版本没有"，不能显示成成功或泛泛的失败（PRD §11.3：不假装执行）。

export const NOT_AVAILABLE_TITLE: string = "Not available in this build";

export function isNotImplemented(error: unknown): boolean {
	return error instanceof ApiRequestError && error.status === 501;
}

export function isUnauthenticated(error: unknown): boolean {
	return error instanceof ApiRequestError && error.status === 401;
}

/** 给用户看的错误文字：用 API 的澳式英语 message；其他错误不暴露内部细节。 */
export function describeError(error: unknown): string {
	if (isNotImplemented(error)) return "This part of Super Admin has not been built yet.";
	if (error instanceof ApiRequestError && error.body) return error.body.message;
	return "Something went wrong. Check your connection, then try again.";
}

export interface ErrorAlertProps {
	error: unknown;
	/** 一般失败时的标题，例如 "Couldn't save the provider"。 */
	title: string;
}

/** 501 显示 "Not available in this build"（info），其他错误显示 danger Alert。 */
export function ErrorAlert({ error, title }: ErrorAlertProps): ReactElement {
	if (isNotImplemented(error)) {
		return (
			<Alert variant="info" title={NOT_AVAILABLE_TITLE} isAnnounced>
				<p>{describeError(error)} Nothing was changed.</p>
			</Alert>
		);
	}
	return (
		<Alert variant="danger" title={title} isAnnounced>
			<p>{describeError(error)}</p>
		</Alert>
	);
}
