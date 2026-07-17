# 窄屏顶部菜单换行 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在顶部菜单模式下，让 1024px 以下窗口的水平菜单独占头部第二行，并同步增加布局头部高度，避免菜单被挤压或覆盖多页签。

**Architecture:** 用一个无副作用的布局判断模块统一计算“窄屏顶部菜单”与头部高度。`GlobalHeader` 在该判断为真时渲染独立菜单行，`useBasicLayout` 使用同一规则为 `AdminLayout` 提供双行高度；其他布局和桌面端继续使用单行结构。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、`@vueuse/core` `useWindowSize`、Naive UI `n-menu`、Node 24 内置测试运行器。

---

### Task 1: Add a pure responsive-layout rule and regression tests

**Files:**
- Create: `src/utils/layout/mobileHeader.ts`
- Create: `tests/layout/mobile-header.test.mts`

- [ ] **Step 1: Write the failing test**

Create a Node test that imports the not-yet-created helper and specifies the three required states:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {getGlobalHeaderHeight, isMobileHorizontalHeader} from "../../src/utils/layout/mobileHeader.ts";

test("uses a second row for horizontal menus below 1024px", () => {
    assert.equal(isMobileHorizontalHeader(true, 655), true);
    assert.equal(getGlobalHeaderHeight(56, true, 655), 112);
});

test("keeps the desktop horizontal menu on one row at the breakpoint", () => {
    assert.equal(isMobileHorizontalHeader(true, 1024), false);
    assert.equal(getGlobalHeaderHeight(56, true, 1024), 56);
});

test("does not change non-horizontal layouts on narrow screens", () => {
    assert.equal(isMobileHorizontalHeader(false, 655), false);
    assert.equal(getGlobalHeaderHeight(56, false, 655), 56);
});
```

- [ ] **Step 2: Run the test to verify it fails for the missing behavior**

Run:

```powershell
node --experimental-strip-types --test tests/layout/mobile-header.test.mts
```

Expected: the test runner fails because `src/utils/layout/mobileHeader.ts` does not exist yet. This confirms the regression test is exercising the new helper rather than existing behavior.

- [ ] **Step 3: Write the minimal implementation**

Create `src/utils/layout/mobileHeader.ts`:

```ts
export const MOBILE_HEADER_BREAKPOINT = 1024;

export function isMobileHorizontalHeader(showHeaderMenu: boolean, width: number): boolean {
    return showHeaderMenu && width < MOBILE_HEADER_BREAKPOINT;
}

export function getGlobalHeaderHeight(headerHeight: number, showHeaderMenu: boolean, width: number): number {
    return isMobileHorizontalHeader(showHeaderMenu, width) ? headerHeight * 2 : headerHeight;
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run the same Node test command. Expected: 3 tests pass with zero failures.

- [ ] **Step 5: Commit the self-contained helper and regression test**

```powershell
git add -- src/utils/layout/mobileHeader.ts tests/layout/mobile-header.test.mts
git commit -m "test: cover mobile horizontal header sizing"
```

### Task 2: Render the horizontal menu on a second narrow-screen row

**Files:**
- Modify: `src/layouts/common/GlobalHeader/index.vue`

- [ ] **Step 1: Add the reactive viewport rule**

Import `computed` and `useWindowSize`, keep the existing props in a named `const`, and derive the row condition from the shared helper:

```ts
import {computed, defineComponent, onMounted, reactive, Ref, ref} from "vue";
import {useWindowSize} from "@vueuse/core";
import {isMobileHorizontalHeader} from "@/utils/layout/mobileHeader";

const props = defineProps<{
    showLogo: GlobalHeaderProps["showLogo"];
    showHeaderMenu: GlobalHeaderProps["showHeaderMenu"];
    showMenuCollape: GlobalHeaderProps["showMenuCollape"];
}>();
const {width} = useWindowSize();
const mobileHorizontalHeader = computed(() => isMobileHorizontalHeader(props.showHeaderMenu, width.value));
```

Remove the earlier anonymous `defineProps` call so the component has only one props declaration.

- [ ] **Step 2: Split the header template into fixed-height rows**

Make the dark-mode container a column flex container. Put the current header content inside a first row with `shrink-0` and `height: theme.header.height`. Render the desktop `HeaderMenu` in that first row only when `!mobileHorizontalHeader`. Add a second `v-if="mobileHorizontalHeader"` row below it with the same height and full width, containing the existing `HeaderMenu` and the configured horizontal alignment.

The relevant shape is:

```vue
<dark-mode-container class="global-header flex flex-col h-full px-2 overflow-hidden">
    <div
        class="flex items-center w-full shrink-0"
        :style="{height: `${theme.header.height}px`}"
    >
        <!-- existing left and right header controls -->
        <div v-if="showHeaderMenu && !mobileHorizontalHeader" ...>
            <header-menu class="min-w-0"/>
        </div>
    </div>

    <div
        v-if="mobileHorizontalHeader"
        class="flex items-center w-full shrink-0"
        :style="{height: `${theme.header.height}px`, justifyContent: theme.menu.horizontalPosition}"
    >
        <header-menu class="min-w-0"/>
    </div>
</dark-mode-container>
```

Keep the existing left-side breadcrumb/menu-collapse logic and right-side account/date/logout markup unchanged inside the first row. This preserves all existing interactions while changing only the horizontal menu placement.

- [ ] **Step 3: Run typecheck after the template change**

Run:

```powershell
npm run typecheck
```

Expected: exit code 0 with no TypeScript/Vue template errors.

### Task 3: Synchronize `AdminLayout` height with the rendered rows

**Files:**
- Modify: `src/composables/common/layout.ts`
- Modify: `src/layouts/BasicLayout/index.vue`

- [ ] **Step 1: Compute the responsive header height in the layout composable**

In `src/composables/common/layout.ts`, import `useWindowSize` and `getGlobalHeaderHeight`, create a reactive width, and add this computed value:

```ts
const {width} = useWindowSize();
const headerHeight = computed(() =>
    getGlobalHeaderHeight(theme.header.height, theme.layout.mode === "horizontal", width.value)
);
```

Return `headerHeight` alongside the existing layout values.

- [ ] **Step 2: Pass the computed height to `AdminLayout`**

In `src/layouts/BasicLayout/index.vue`, destructure `headerHeight` from `useBasicLayout()` and replace `:header-height="theme.header.height"` with `:header-height="headerHeight"`.

No other `AdminLayout` prop changes are needed. This keeps the layout’s CSS variable, tab placement, and content offset aligned with the two actual header rows.

- [ ] **Step 3: Run the focused regression test and typecheck**

```powershell
node --experimental-strip-types --test tests/layout/mobile-header.test.mts
npm run typecheck
```

Expected: all 3 focused tests pass and typecheck exits with code 0.

### Task 4: Verify production behavior and final scope

**Files:**
- Verify only: `src/layouts/common/GlobalHeader/index.vue`, `src/composables/common/layout.ts`, `src/layouts/BasicLayout/index.vue`, `src/utils/layout/mobileHeader.ts`, `tests/layout/mobile-header.test.mts`

- [ ] **Step 1: Run the production build**

```powershell
npm run build
```

Expected: Vite finishes successfully with exit code 0.

- [ ] **Step 2: Inspect the diff and preserve unrelated changes**

```powershell
git diff --check
git status --short
git diff -- src/layouts/common/GlobalHeader/index.vue src/composables/common/layout.ts src/layouts/BasicLayout/index.vue src/utils/layout/mobileHeader.ts tests/layout/mobile-header.test.mts
```

Confirm that only the requested layout files, the pure helper, and its regression test changed; `.env.development` remains unstaged and untouched.

- [ ] **Step 3: Manually check the target viewport**

Start the app with `npm run dev`, select “顶部菜单模式”, and inspect a viewport around 655px wide. Confirm the first row keeps the account/date/logout controls, the horizontal menu occupies the full second row, and the tab row/content begins below the doubled header. Resize to at least 1024px and confirm the menu returns to the existing desktop row.

- [ ] **Step 4: Commit the implementation**

```powershell
git add -- src/layouts/common/GlobalHeader/index.vue src/composables/common/layout.ts src/layouts/BasicLayout/index.vue src/utils/layout/mobileHeader.ts tests/layout/mobile-header.test.mts
git commit -m "fix: move horizontal menu below mobile header"
```
