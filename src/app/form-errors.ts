// 表单校验用 @carekind/shared 契约里的 zod schema（和 API 是同一份，rules/02 §2.2 DRY）。
// 这里只把 zod 的问题列表转成 "字段名 → 第一条提示"，给 Field 的 error 用。

interface SchemaIssue {
	path: readonly PropertyKey[];
}

/** 不依赖 zod 版本细节：只需要 issues[].path。 */
export interface SafeParseFailure {
	success: false;
	error: { issues: readonly SchemaIssue[] };
}

export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

/**
 * 每个字段只显示一条说明怎么改的提示；嵌套字段（例如 address.state）用点号连接。
 * 文案由调用方按字段给出，不直接显示 zod 的英文默认信息（那不是澳式英语，也不说明怎么改）。
 */
export function toFieldErrors<Field extends string>(
	failure: SafeParseFailure,
	messages: Readonly<Record<Field, string>>,
): FieldErrors<Field> {
	const errors: FieldErrors<Field> = {};
	for (const issue of failure.error.issues) {
		const key = issue.path.map(String).join(".");
		if (key in messages && !(key in errors)) {
			const field = key as Field;
			errors[field] = messages[field];
		}
	}
	return errors;
}
