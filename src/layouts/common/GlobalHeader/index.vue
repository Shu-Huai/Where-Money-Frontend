<template>
    <dark-mode-container class="global-header xl:flex-y-center h-full">
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
        <div class="w-1/10">
            <n-select v-model:value="bookId" :options="bookList" @update:value="changeBook">
                <template #action>
                    <n-button v-on:click="addBook">
                        <template #default>
                            <Icon icon="material-symbols:add" />
                            <span>添加账本</span>
                        </template>
                    </n-button>
                    <n-modal :mask-closable="false" v-model:show="showAdd" class="w-1/2">
                        <n-card id="drawer-target" class="w-full">
                            <template #header>
                                <div>新增账本</div>
                            </template>
                            <template #header-extra>
                                <Icon icon="icon-park-outline:close" class="cursor-pointer h-4 w-4"
                                      v-bind:class="{'text-primary':mouseOnClose}" v-on:mouseenter="mouseOnClose=true"
                                      v-on:mouseleave="mouseOnClose=false"
                                      v-on:click="showAdd=false" />
                            </template>
                            <template #default>
                                <n-form ref="formRef" :model="model" :rules="rules">
                                    <n-form-item path="title" label="账本名称：">
                                        <n-input v-model:value="model.title" @keydown.enter.prevent />
                                    </n-form-item>
                                    <n-form-item path="beginDate" label="开始日期：">
                                        <n-input v-model:value="model.beginDate" @keydown.enter.prevent />
                                    </n-form-item>
                                </n-form>
                                <n-button class="w-full addButton" type="primary" v-on:click="submitBook">
                                    <template #default>
                                        保存
                                    </template>
                                </n-button>
                            </template>
                        </n-card>
                    </n-modal>
                </template>
            </n-select>
        </div>
        <div class="flex items-center h-full ml-1/40">
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
                <n-button :bordered="false" class="w-48px h-full" @click="showExitModal = true">
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
import { defineComponent, onMounted, reactive, Ref, ref } from "vue";
import { Router } from "vue-router";
import { ExitOutline } from "@vicons/ionicons5";
import { DarkModeContainer, HoverContainer } from "@/components";
import { useThemeStore } from "@/store";
import { useRouterPush } from "@/composables";
import { storage } from "@/utils";
import type { Book, BookGetAllBookResponse, GlobalHeaderProps } from "@/interface";
import { useStore } from "@/stores/store";
import GlobalLogo from "../GlobalLogo/index.vue";
import { FullScreen, GithubSite, GlobalBreadcrumb, HeaderMenu, MenuCollapse, ThemeMode } from "./components";
import { Icon } from "@iconify/vue";
import { dateToString, now } from "@/utils/dateComputer";
import { addBookApi, getAllBookApi } from "@/apis";

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
declare const window: Window & { $router: Router; $message: any; };

function goPre(): void {
    routerBack();
}

function ExitLogin(): void {
    storage.remove("token");
    storage.remove("bookId");
    store.bookId = 0;
    routerPush({ name: "login" });
}

let nowDate: Ref<string> = ref(dateToString(now()).split(" ")[0]);
let bookId: Ref<number> = ref(0);

interface BookShow extends Book {
    value: number;
    label: string;
}

let bookList: Ref<Array<BookShow>> = ref([]);
onMounted(() => {
    bookId.value = storage.get("bookId") || 0;
    getAllBookApi().then((res: BookGetAllBookResponse) => {
        bookList.value = res.bookList.map((item: Book) => {
            return {
                ...item,
                value: item.id,
                label: item.title
            };
        });
        if (bookId.value === 0) {
            bookId.value = bookList.value[0].value;
            storage.set("bookId", bookId.value);
        }
        store.bookId = bookId.value;
    });
});

function changeBook(value: number): void {
    bookId.value = value;
    storage.set("bookId", value);
    store.bookId = value;
}

let showAdd: Ref<boolean> = ref(false);
let mouseOnClose: Ref<boolean> = ref(false);

function addBook(): void {
    showAdd.value = true;
}

interface addData {
    title: string;
    beginDate: string;
}

const model = reactive<addData>({
    title: "",
    beginDate: "1"
});
const formRef = ref();
const rules = {
    title: {
        required: true,
        message: "请输入名称",
        trigger: "blur"
    },
    beginDate: {
        required: true,
        message: "请选择账单起始日",
        trigger: "blur"
    }
};

function submitBook(): void {
    formRef.value?.validate((errors: any) => {
        if (!errors) {
            addBookApi({ title: model.title, beginDate: parseInt(model.beginDate) }).then(() => {
                window.$message.error("新增成功");
                showAdd.value = false;
            });
        }
    });
}

defineExpose({ ExitLogin, goPre, showExitModal });
</script>
<style scoped>
</style>
