import.meta.glob("../../routes/client/emoji-*/index.ts", { eager: true });

console.log("已加载的路由模块:");
console.log("- emojis");
console.log("- emoji-collections");
console.log("- emoji-favorites");
console.log("- emoji-usage-logs");

export {};
