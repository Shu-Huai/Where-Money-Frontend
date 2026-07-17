import test from "node:test";
import assert from "node:assert/strict";
import {resolveThemeTabVisible} from "../src/store/modules/theme/persistence.ts";

test("uses the saved multi-tab visibility after refresh", () => {
    assert.equal(resolveThemeTabVisible(false, true), false);
});

test("uses the default when no valid visibility preference was saved", () => {
    assert.equal(resolveThemeTabVisible(null, true), true);
    assert.equal(resolveThemeTabVisible("false", true), true);
});
