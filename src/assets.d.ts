// 让 TypeScript 认识通过 Vite 导入的品牌资产（返回 URL 字符串）。
declare module "@carekind/shared/brand/*.svg" {
	const url: string;
	export default url;
}

declare module "@carekind/shared/brand/*.png" {
	const url: string;
	export default url;
}
