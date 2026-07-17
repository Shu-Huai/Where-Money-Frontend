import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "../..");

test("about page and direct references are removed", () => {
    assert.equal(existsSync(resolve(projectRoot, "src/views/about/index.vue")), false);

    const routeSource = readFileSync(resolve(projectRoot, "src/router/routes/index.ts"), "utf8");
    const typeSource = readFileSync(resolve(projectRoot, "src/typings/common/route.d.ts"), "utf8");
    const readmeSource = readFileSync(resolve(projectRoot, "README.md"), "utf8");

    assert.doesNotMatch(routeSource, /about/);
    assert.doesNotMatch(typeSource, /about/);
    assert.doesNotMatch(readmeSource, /about/);
});
