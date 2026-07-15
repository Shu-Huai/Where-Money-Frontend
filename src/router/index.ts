import type {App} from "vue";
import {createRouter, createWebHashHistory, createWebHistory} from "vue-router";
import {transformAuthRoutesToVueRoutes} from "@/utils";
import {constantRoutes} from "./routes";
import {scrollBehavior} from "./helpers";
import {createRouterGuard} from "./guard";

const isHarmony = import.meta.env.MODE === "harmony";
const createHistoryFunc = isHarmony || import.meta.env.VITE_IS_VERCEL === "1"
    ? createWebHashHistory
    : createWebHistory;

export const router = createRouter({
    history: createHistoryFunc(import.meta.env.VITE_APP_BASE_URL),
    routes: transformAuthRoutesToVueRoutes(constantRoutes),
    scrollBehavior
});

export function setupRouter(app: App) {
    app.use(router);
    createRouterGuard(router);
}

export * from "./routes";
export default router;
