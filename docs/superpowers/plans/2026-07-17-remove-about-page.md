# 删除关于页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除关于页面及其路由、类型和 README 引用。

**Architecture:** 不新增替代页面或导航逻辑，仅移除 `src/views/about/`、路由配置中的 about 条目、路由类型成员和 README 页面列表项。用 Node 内置测试先验证删除目标当前确实存在，再在删除后验证所有直接引用消失。

**Tech Stack:** Vue 3、TypeScript、Node 24 内置测试运行器、Vite。

---

### Task 1: Add a failing removal regression test

**Files:**
- Create: `tests/pages/about-page-removal.test.mts`

- [ ] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "../..");

test("about page and direct references are removed", () => {
    assert.equal(existsSync(resolve(projectRoot, "src/views/about")), false);

    const routeSource = readFileSync(resolve(projectRoot, "src/router/routes/index.ts"), "utf8");
    const typeSource = readFileSync(resolve(projectRoot, "src/typings/common/route.d.ts"), "utf8");
    const readmeSource = readFileSync(resolve(projectRoot, "README.md"), "utf8");

    assert.doesNotMatch(routeSource, /about/);
    assert.doesNotMatch(typeSource, /about/);
    assert.doesNotMatch(readmeSource, /about/);
});
```

- [ ] **Step 2: Run it and confirm the expected failure**

```powershell
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/pages/about-page-removal.test.mts
```

Expected: FAIL because `src/views/about/` and the about route references still exist.

### Task 2: Remove the page and direct references

**Files:**
- Delete: `src/views/about/index.vue`
- Delete: `src/views/about/model.ts`
- Delete: `src/views/about/components/DevDependency.vue`
- Delete: `src/views/about/components/ProDependency.vue`
- Delete: `src/views/about/components/ProjectInfo.vue`
- Delete: `src/views/about/components/ProjectIntroduction.vue`
- Delete: `src/views/about/components/index.ts`
- Modify: `src/router/routes/index.ts`
- Modify: `src/typings/common/route.d.ts`
- Modify: `README.md`

- [ ] **Step 1: Remove the about route block**

Delete only the route object whose `name` is `"about"` and whose `path` is `"/about"` from `src/router/routes/index.ts`.

- [ ] **Step 2: Remove the route type and README entry**

Delete the `| "about"` union member from `src/typings/common/route.d.ts` and remove `about` from the README page list.

- [ ] **Step 3: Delete the page directory**

Delete all files under `src/views/about/`; do not modify other view directories.

- [ ] **Step 4: Run the focused regression test**

```powershell
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/pages/about-page-removal.test.mts
```

Expected: PASS with one test and zero failures.

- [ ] **Step 5: Commit the removal**

```powershell
git add -- README.md src/router/routes/index.ts src/typings/common/route.d.ts src/views/about tests/pages/about-page-removal.test.mts
git commit -m "refactor: remove about page"
```

### Task 3: Verify the application and scope

**Files:**
- Verify: `README.md`, `src/router/routes/index.ts`, `src/typings/common/route.d.ts`, `src/views/about/`, `tests/pages/about-page-removal.test.mts`

- [ ] **Step 1: Search for remaining direct references**

```powershell
$out = rg -n --hidden -g '!node_modules' -g '!src/graphify-out' "关于|about|About|ProjectInfo|ProjectIntroduction" src README.md
if ($out) { $out } else { "NO_ABOUT_REFERENCES" }
```

Expected: `NO_ABOUT_REFERENCES`.

- [ ] **Step 2: Run the production build**

```powershell
npm run build
```

Expected: Vite exits with code 0.

- [ ] **Step 3: Check the final diff**

```powershell
git diff --check HEAD~1..HEAD
git status --short
```

Confirm `.env.development` remains unstaged and unrelated existing/generated files are not included in the removal commit.
