# 删除关于页面设计

## 目标

从应用中移除“关于”页面，使用户无法通过路由或菜单访问该页面，同时清理不再使用的页面代码和文档引用。

## 范围

- 删除 `src/views/about/` 页面及其组件、模型文件。
- 删除 `src/router/routes/index.ts` 中的 `about` 路由配置。
- 删除 `src/typings/common/route.d.ts` 中的 `"about"` 路由类型成员。
- 更新 README 页面列表，移除 `about`。
- 不修改其他页面、菜单生成逻辑或通用布局。

## 验证

- 源码中不再存在 `about` 路由、页面组件或页面列表引用。
- 生产构建通过。
- 保留并核对用户已有的 `.env.development` 修改，不纳入提交。
