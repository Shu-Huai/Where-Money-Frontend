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
