<template>
    <dark-mode-container class="global-header flex-y-center h-full">
        <global-logo
            v-if="showLogo"
            :show-title="true"
            :style="{ width: theme.sider.width + 'px' }"
            class="h-full"
        />
        <div v-if="!showHeaderMenu" class="flex-1-hidden flex-y-center h-full">
            <menu-collapse v-if="showMenuCollape" />
            <global-breadcrumb v-if="theme.header.crumb.visible" />
        </div>
        <div
            v-else
            :style="{ justifyContent: theme.menu.horizontalPosition }"
            class="flex-1-hidden flex-y-center h-full"
        >
            <header-menu />
        </div>
        <div class="flex items-center h-full">
            <div class="flex items-center text-semobold mr-3 gap-2">
                <div>
                    <Icon :icon="'ri:calendar-2-fill'" class="text-20px" />
                </div>
                {{ nowDate }}
            </div>
            <github-site />
            <full-screen />
            <theme-mode />
            <hover-container class="w-40px h-full" tooltip-content="退出">
                <n-button :bordered="false" class="w-35px h-full" @click="showExitModal = true">
                    <Icon :icon="'ri:logout-box-r-line'" class="text-20px" />
                </n-button>
            </hover-container>
        </div>
    </dark-mode-container>
    <div>
        <n-modal v-model:show="showExitModal">
            <div class="s-card p-8 space-y-7">
                <div class="s-title s-underline text-lg">提示</div>
                <div class="mx-auto text-lg">即将退出登录，是否继续？</div>
                <div class="flex items-center gap-6 justify-end">
                    <n-button @click="ExitLogin">确认</n-button>
                    <n-button type="primary" @click="showExitModal = false">返回</n-button>
                </div>
            </div>
        </n-modal>
    </div>
</template>

<script lang="ts" setup>
import { defineComponent, Ref, ref } from "vue";
import { Router } from "vue-router";
import { ExitOutline } from "@vicons/ionicons5";
import { DarkModeContainer, HoverContainer } from "@/components";
import { useThemeStore } from "@/store";
import { useRouterPush } from "@/composables";
import { storage } from "@/utils";
import type { GlobalHeaderProps } from "@/interface";
import { useStore } from "@/stores/store";
import GlobalLogo from "../GlobalLogo/index.vue";
import { FullScreen, GithubSite, GlobalBreadcrumb, HeaderMenu, MenuCollapse, ThemeMode } from "./components";
import { Icon } from "@iconify/vue";
import { dateToString, now } from "@/utils/dateComputer";

const { routerPush, routerBack } = useRouterPush();
defineProps<{
    showLogo: GlobalHeaderProps["showLogo"];
    showHeaderMenu: GlobalHeaderProps["showHeaderMenu"];
    showMenuCollape: GlobalHeaderProps["showMenuCollape"];
}>();
const theme = useThemeStore();
const store = useStore();
const showExitModal: Ref<boolean> = ref(false);
defineComponent({
    components: {
        ExitOutline
    }
});
declare const window: Window & { $router: Router };

function goPre(): void {
    routerBack();
}

function ExitLogin(): void {
    storage.remove("token");
    routerPush({ name: "login" });
}

now();
let nowDate: Ref<string> = ref(dateToString(now()).split(" ")[0]);
defineExpose({ ExitLogin, goPre, showExitModal });
</script>
<style scoped>
</style>
