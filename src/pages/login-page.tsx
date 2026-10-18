import { useState, type FormEvent, type ReactElement } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router";
import { authEndpoints } from "@carekind/shared/contracts";
import { Alert, Button, TextInput } from "@carekind/shared/ui";
import logoBlackUrl from "@carekind/shared/brand/carekind-logo-black.svg";
import { authApi } from "../app/api.ts";
import { useCurrentUserQuery, type LoginRedirectState } from "../app/auth.tsx";
import { describeError } from "../app/errors.tsx";
import { toFieldErrors, type FieldErrors } from "../app/form-errors.ts";
import { queryKeys } from "../app/query-client.ts";

// Super Admin 登录（super-admin audience）。没有 MFA（ADR-0005）。
// 登录失败统一显示 API 的说明，不区分"邮箱不存在"和"密码错误"（防止枚举账号）。

type LoginField = "email" | "password";

const FIELD_MESSAGES: Readonly<Record<LoginField, string>> = {
	email: "Enter your careKind work email address, like name@carekind.com.au.",
	password: "Enter your password.",
};

function redirectTarget(state: unknown): string {
	const from = (state as Partial<LoginRedirectState> | null)?.from;
	return from && from.startsWith("/") && from !== "/login" ? from : "/providers";
}

export function LoginPage(): ReactElement {
	const location = useLocation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const currentUser = useCurrentUserQuery();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fieldErrors, setFieldErrors] = useState<FieldErrors<LoginField>>({});
	const target = redirectTarget(location.state);

	const login = useMutation({
		mutationFn: (body: { email: string; password: string }) => authApi.superAdminLogin({ body }),
		onSuccess: (result) => {
			queryClient.setQueryData(queryKeys.currentUser, result.user);
			navigate(target, { replace: true });
		},
	});

	if (currentUser.data) return <Navigate to={target} replace />;

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		const parsed = authEndpoints.superAdminLogin.body.safeParse({ email: email.trim(), password });
		if (!parsed.success) {
			setFieldErrors(toFieldErrors(parsed, FIELD_MESSAGES));
			return;
		}
		setFieldErrors({});
		login.mutate(parsed.data);
	}

	// 内部登录以表单为中心；复用正式控件，不引入营销 Hero 或装饰浮卡。
	return (
		<div className="sa-login">
			<header className="sa-login-header">
				<img className="sa-login-logo" src={logoBlackUrl} alt="careKind" width={180} height={40} />
				<span className="ck-tag">Internal workspace</span>
			</header>
			<main className="sa-login-main">
				<section className="sa-login-panel" aria-labelledby="login-title">
					<div className="sa-login-intro">
						<p className="sa-muted">Super Admin</p>
						<h1 id="login-title">Sign in to your workspace</h1>
						<p className="ck-muted">Manage providers and facilities with care.</p>
					</div>
					<form className="sa-login-card" onSubmit={handleSubmit} noValidate>
						{login.isError ? (
							<Alert variant="danger" title="Couldn't sign you in" isAnnounced>
								<p>{describeError(login.error)}</p>
							</Alert>
						) : null}
						<TextInput
							label="Work email"
							type="email"
							autoComplete="username"
							autoCapitalize="none"
							spellCheck={false}
							value={email}
							error={fieldErrors.email}
							onChange={(event) => setEmail(event.target.value)}
						/>
						<TextInput
							label="Password"
							type="password"
							autoComplete="current-password"
							value={password}
							error={fieldErrors.password}
							onChange={(event) => setPassword(event.target.value)}
						/>
						<Button
							className="sa-login-submit"
							type="submit"
							variant="primary"
							size="lg"
							isLoading={login.isPending}
							loadingText="Signing in…"
						>
							Sign in <span aria-hidden="true">→</span>
						</Button>
					</form>
					<p className="sa-login-access ck-muted">For careKind staff only. Use your work account.</p>
				</section>
			</main>
			<footer className="sa-login-footer">
				<span>careKind · Super Admin</span>
				<span>Provider and facility administration</span>
			</footer>
		</div>
	);
}
