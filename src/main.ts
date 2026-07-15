import {createApp} from "vue";
import {setupAssets, setupNaiveUI} from "@/plugins";
import {router, setupRouter} from "@/router";
import {setupStore} from "@/store";
import App from "./App.vue";

window.addEventListener("error", event => {
    console.error("[WhereMoney][RuntimeError]", event.error?.stack || event.message);
});

window.addEventListener("unhandledrejection", event => {
    const reason = event.reason as { stack?: string; message?: string } | undefined;
    console.error("[WhereMoney][UnhandledRejection]", reason?.stack || reason?.message || String(event.reason));
});

window.addEventListener("where-money-system-theme-change", event => {
    const dark = (event as CustomEvent<{ dark: boolean }>).detail?.dark;
    if (typeof dark === "boolean") {
        (window as Window & { __WHERE_MONEY_SYSTEM_DARK__?: boolean }).__WHERE_MONEY_SYSTEM_DARK__ = dark;
        window.localStorage.setItem("__WHERE_MONEY_SYSTEM_DARK__", String(dark));
        document.documentElement.classList.toggle("dark", dark);
    }
});

async function setupApp() {
    console.info("[WhereMoney][App] main.ts loaded");
    if (import.meta.env.MODE === "harmony") {
        document.documentElement.classList.add("harmony");
    }
    setupAssets();
    const app = createApp(App);
    setupStore(app);
    setupNaiveUI(app);
    setupRouter(app);
    app.mount("#app");
    document.getElementById("app-loading")?.remove();
    console.info("[WhereMoney][App] Vue mounted");
    router.isReady().catch(error => {
        console.error("[WhereMoney][RouterReadyFailed]", error?.stack || error);
    });
}

setupApp().catch(error => {
    console.error("[WhereMoney][AppStartupFailed]", error?.stack || error);
    const loading = document.getElementById("app-loading");
    if (loading) {
        loading.innerHTML = "<div style=\"padding:24px;text-align:center;color:#666\">应用启动失败，请查看设备日志</div>";
    }
});
