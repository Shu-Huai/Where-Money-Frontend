# 鸿蒙端 Message 状态栏避让设计

## 背景

鸿蒙 ArkWeb 使用透明状态栏并开启全屏布局。项目已经为应用根节点和抽屉增加顶部安全区，但 Naive UI 的 `n-message-container` 使用 `position: fixed`，默认顶部位置不会继承应用根节点的内边距，导致登录成功、登录失败、密码错误等顶部提示可能被状态栏遮挡。

## 目标

- 鸿蒙端所有顶部 `message` 统一避让状态栏。
- 登录页现有 `message` 调用保持不变。
- 非鸿蒙端行为不变。
- 底部 `message` 不增加无关的顶部偏移。

## 方案

在全局 CSS 中定义鸿蒙顶部安全区变量，并复用到已有的应用根节点、抽屉以及 Naive UI 顶部 message 容器：

- `.harmony` 设置 `--harmony-status-bar-inset: 36px`。
- `.harmony .app-root` 使用该变量作为 `padding-top`。
- `.harmony .n-drawer-container` 使用该变量计算 `top` 和 `height`。
- `.harmony .n-message-container--top`、`--top-left`、`--top-right` 使用 `calc(12px + var(--harmony-status-bar-inset))`。

这样只在 Harmony 构建模式下生效，且保留 Naive UI 原有的 12px 内容间距。

## 验证

运行项目已有的 `typecheck`，执行 Harmony 构建，确认生成的静态资源包含安全区规则；再执行 Harmony 同步脚本，确保鸿蒙端使用最新资源。
