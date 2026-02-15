<template>
    <div>
        <div class="space-y-10">
            <n-scrollbar class="h-50 lg:h-70">
                <n-spin v-if="isLoading" class="flex items-center h-50 lg:h-70"></n-spin>
                <div class="grid grid-cols-6 lg:grid-cols-10 lg:gap-4 gap-1">
                    <BillCategoryItem v-for="item in billCategoryList" :billCategory="item"></BillCategoryItem>
                    <n-button class="w-full h-12 my-auto" strong secondary type="primary"
                              v-on:click="openCategoryManager">管理
                    </n-button>
                </div>
            </n-scrollbar>
            <n-modal v-model:show="showUpdateModal">
                <n-card class="w-[92vw] max-w-[980px]">
                    <template #header>
                        <div class="flex gap-2 flex-row items-center xl:justify-between">
                            <div class="space-y-1">
                                <div class="text-base font-semibold">分类管理</div>
                            </div>
                            <div class="flex items-center gap-2">
                                <n-button size="small" secondary v-on:click="refreshBillCategoryList(true)">
                                    刷新
                                </n-button>
                            </div>
                        </div>
                    </template>
                    <template #header-extra>
                        <Icon class="cursor-pointer h-4 w-4" icon="icon-park-outline:close"
                              v-bind:class="{'text-primary':mouseOnClose}" v-on:click="showUpdateModal = false"
                              v-on:mouseenter="mouseOnClose=true"
                              v-on:mouseleave="mouseOnClose=false"/>
                    </template>

                    <template #default>
                        <div class="flex flex-col gap-4 h-[70vh] xl:h-auto xl:grid xl:grid-cols-3 xl:gap-4">
                            <div
                                class="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3 flex-none transition-[max-height] duration-200"
                                :class="editingCategoryId ? 'max-h-16 overflow-hidden xl:max-h-none xl:overflow-visible' : 'max-h-none'"
                            >
                                <div class="flex items-center justify-between">
                                    <div class="text-sm font-semibold">新增分类</div>
                                    <div class="text-xs text-gray-500">名称必填</div>
                                </div>
                                <div class="space-y-2">
                                    <n-input
                                        v-model:value="addCategoryForm.name"
                                        placeholder="分类名称"
                                        clearable
                                    />
                                    <div class="flex flex-col xl:flex-row xl:items-center gap-2">
                                        <n-input
                                            v-model:value="addCategoryForm.svg"
                                            class="w-full xl:flex-1"
                                            placeholder="图标（Iconify 名称，可空）"
                                            clearable
                                        />
                                        <div class="flex items-center gap-2">
                                            <n-button size="small" secondary v-on:click="openIconPicker('add')">
                                                选择图标
                                            </n-button>
                                            <div
                                                class="h-9 w-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0">
                                                <Icon :icon="addCategoryForm.svg || 'icon-park-outline:tag'"
                                                      class="text-primary w-5 h-5"/>
                                            </div>
                                        </div>
                                    </div>
                                    <n-select
                                        v-model:value="addCategoryForm.type"
                                        :options="categoryTypeOptions"
                                        size="small"
                                    />
                                    <n-button
                                        class="w-full"
                                        type="primary"
                                        :loading="addCategoryLoading"
                                        v-on:click="addCategory"
                                    >
                                        添加
                                    </n-button>
                                </div>
                            </div>
                            <div
                                class="xl:col-span-2 rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-3 flex-1 min-h-0 xl:flex-none">
                                <div class="flex items-center justify-between">
                                    <div class="text-sm font-semibold">已有分类</div>
                                    <div class="text-xs text-gray-500">共 {{ billCategoryList.length }} 项</div>
                                </div>
                                <n-spin :show="isManageLoading" class="flex-1 min-h-0">
                                    <n-scrollbar class="xl:max-h-96 pr-2"
                                                 :class="editingCategoryId ? 'max-h-100 ':'max-h-50 '">
                                        <div v-if="billCategoryList.length === 0"
                                             class="text-center text-sm text-gray-500 py-6">
                                            暂无分类
                                        </div>
                                        <div v-for="item in billCategoryList" v-bind:key="item.id"
                                             class="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                                            <div class="flex items-center justify-between gap-2">
                                                <div class="flex items-center gap-3 min-w-0">
                                                    <div
                                                        class="h-9 w-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0">
                                                        <Icon :icon="item.svg || 'icon-park-outline:tag'"
                                                              class="text-primary w-5 h-5"/>
                                                    </div>
                                                    <div class="min-w-0">
                                                        <div class="text-sm font-medium truncate">
                                                            {{ item.billCategoryName }}
                                                        </div>
                                                        <div class="text-xs text-gray-500">
                                                            ID: {{ item.id }} · {{ item.type }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="flex items-center gap-2 shrink-0">
                                                    <n-button size="small" secondary
                                                              v-on:click="startEditCategory(item)">
                                                        编辑
                                                    </n-button>
                                                    <n-button size="small" type="error" ghost
                                                              :loading="deletingCategoryId === item.id"
                                                              v-on:click="deleteCategory(item)">
                                                        删除
                                                    </n-button>
                                                </div>
                                            </div>
                                            <div v-if="editingCategoryId === item.id"
                                                 class="space-y-2 pt-2 border-t border-dashed border-gray-200">
                                                <div class="grid grid-cols-1 xl:grid-cols-2 gap-2">
                                                    <n-input
                                                        v-model:value="editCategoryForm.name"
                                                        :placeholder="`名称（当前：${item.billCategoryName}）`"
                                                        clearable
                                                    />
                                                    <div class="flex flex-col xl:flex-row xl:items-center gap-2">
                                                        <n-input
                                                            v-model:value="editCategoryForm.svg"
                                                            class="w-full xl:flex-1"
                                                            :placeholder="`图标（当前：${item.svg || '无'}）`"
                                                            clearable
                                                        />
                                                        <div class="flex items-center gap-2">
                                                            <n-button size="small" secondary
                                                                      v-on:click="openIconPicker('edit')">
                                                                选择图标
                                                            </n-button>
                                                            <div
                                                                class="h-9 w-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0">
                                                                <Icon
                                                                    :icon="editCategoryForm.svg || 'icon-park-outline:tag'"
                                                                    class="text-primary w-5 h-5"/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="grid grid-cols-1 xl:grid-cols-2 gap-2">
                                                    <n-select
                                                        v-model:value="editCategoryForm.type"
                                                        :options="categoryTypeOptions"
                                                        :placeholder="`类型（当前：${item.type}）`"
                                                        clearable
                                                    />
                                                    <div
                                                        class="text-xs text-gray-500 flex items-center xl:justify-end">
                                                        留空将提交 null
                                                    </div>
                                                </div>
                                                <div class="flex items-center gap-2">
                                                    <n-button size="small" type="primary"
                                                              :loading="editCategoryLoading"
                                                              v-on:click="applyEditCategory(item)">
                                                        保存
                                                    </n-button>
                                                    <n-button size="small" v-on:click="cancelEditCategory">
                                                        取消
                                                    </n-button>
                                                </div>
                                            </div>
                                        </div>
                                    </n-scrollbar>
                                </n-spin>
                            </div>
                        </div>
                    </template>
                </n-card>
            </n-modal>
            <IconifyPicker v-model:show="showIconPicker" v-on:select="handleIconSelected" />
            <div class="space-y-2">
                <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    <div class="col-span-1 lg:col-span-2">
                        <n-input v-model:value="remark" placeholder="点此输入备注" type="text"/>
                    </div>
                    <div class="col-span-1">
                        <n-input-number v-model:value="amount" step="0.01">
                            <template #prefix>
                                ￥
                            </template>
                        </n-input-number>
                    </div>
                </div>
                <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    <div class="col-span-1">
                        <n-button class="w-full truncate" v-on:click="bookDrawerShower">
                            <template #default>
                                <n-spin v-if="isLoading" class="items-center h-4 w-4"></n-spin>
                                <div v-if="!isLoading" class="text-left">
                                    {{ bookName }}
                                </div>
                            </template>
                        </n-button>
                    </div>
                    <div class="col-span-1">
                        <n-button class="w-full truncate" v-on:click="assetDrawerShower">
                            <template #default>
                                <div class="flex space-x-2">
                                    <div v-if="assetName!=='收款账户'">
                                        <Icon :icon="assetSvg" class="text-primary w-4 h-4"/>
                                    </div>
                                    <div class="m-auto">
                                        {{ assetName }}
                                    </div>
                                    <div v-if="assetName!=='收款账户'" class="m-auto">
                                        ￥{{ assetBalance }}
                                    </div>
                                </div>
                            </template>
                        </n-button>
                    </div>
                    <div class="col-span-2 lg:col-span-1">
                        <n-date-picker v-model:value="timestamp" :input-readonly="true" placement="top-start"
                                       type="datetime" :update-value-on-close="true"
                                       :time-picker-props="timePickerProps"/>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <n-upload :custom-request="customRequest" class="w-1/5 upload-mini-on-mobile"
                              list-type="image-card" max="1" v-on:change="changePicture"
                              v-on:before-upload="beforeUpload">
                        <template #default>
                            <div>
                                图片
                            </div>
                        </template>
                    </n-upload>
                    <div class="my-auto">
                        {{ fileName }}
                    </div>
                </div>
            </div>
            <div>
                <n-button class="w-full addButton" type="primary" v-on:click="addBill">
                    <template #default>
                        保存
                    </template>
                </n-button>
            </div>
        </div>
        <n-drawer v-model:show="showAssetDrawer" :height="400" :placement="'bottom'" to="#drawer-target">
            <n-drawer-content>
                <template #header>
                    <div>
                        选择收款账户
                    </div>
                </template>
                <template #default>
                    <div>
                        <n-scrollbar class="h-78">
                            <n-spin v-if="isAssetLoading" class="flex items-center h-78"></n-spin>
                            <n-radio-group v-if="!isAssetLoading" v-model:value="assetSelector" class="space-y-4 ">
                                <div v-for="item in assetList">
                                    <n-radio v-bind:key="item.id" v-bind:value="item.assetName">
                                        <div class="flex space-x-2 align-middle">
                                            <div>
                                                <Icon :icon="item.svg" class="text-primary w-8 h-8"/>
                                            </div>
                                            <div class="w-100 m-auto">
                                                {{ item.assetName }}
                                            </div>
                                            <div class="m-auto">
                                                ￥{{ item.balance }}
                                            </div>
                                        </div>
                                    </n-radio>
                                </div>
                            </n-radio-group>
                        </n-scrollbar>
                    </div>
                </template>
            </n-drawer-content>
        </n-drawer>
        <n-drawer v-model:show="showBookDrawer" :height="400" :placement="'bottom'" to="#drawer-target">
            <n-drawer-content>
                <template #header>
                    <div>
                        选择账本
                    </div>
                </template>
                <template #default>
                    <n-scrollbar class="h-78">
                        <n-spin v-if="isBookLoading" class="flex items-center h-78"></n-spin>
                        <n-radio-group v-if="!isBookLoading" v-model:value="bookSelector" class="space-y-4 ">
                            <div v-for="item in bookList">
                                <n-radio v-bind:key="item.id" v-bind:value="item.title">
                                    <div class="flex space-x-2 item-center">
                                        <div class="w-128 m-auto">
                                            {{ item.title }}
                                        </div>
                                        <div>
                                            <n-tag class="bg-primary-active cursor-pointer">
                                                每月{{ item.beginDate }}日起始
                                            </n-tag>
                                        </div>
                                    </div>
                                </n-radio>
                            </div>
                        </n-radio-group>
                    </n-scrollbar>
                </template>
            </n-drawer-content>
        </n-drawer>
    </div>
</template>

<script lang="ts" setup>
import {
    addBillApi,
    addBillCategoryApi,
    deleteBillCategoryApi,
    getAllAsset,
    getAllBillCategoryApi,
    getAllBookApi,
    getAssetApi,
    getBookApi,
    updateBillCategoryApi
} from "@/apis";
import {
    Asset,
    AssetGetAllAssetResponse,
    AssetGetAssetResponse,
    BillCategory,
    Book,
    BookAllBillCategoryResponse,
    BookGetAllBookResponse,
    BookGetBookResponse
} from "@/interface";
import {onMounted, ref, Ref, watch} from "vue";
import {TimePickerProps, UploadCustomRequestOptions, UploadFileInfo} from "naive-ui";
import {intToString} from "@/utils/dateComputer";
import {Icon} from "@iconify/vue";
import {BillCategoryItem} from "./components";
import {useStore} from "@/stores/store";
import IconifyPicker from "@/components/custom/IconifyPicker/index.vue";

let timePickerProps: TimePickerProps = {inputReadonly: true};
let remark: Ref<string> = ref("");
let amount: Ref<number> = ref(0);
let bookName: Ref<string> = ref("");
let bookId: Ref<number> = ref(0);
let timestamp: Ref<number> = ref(0);
let assetName: Ref<string> = ref("");
let assetBalance: Ref<number> = ref(0);
let assetSvg: Ref<string> = ref("");
let billCategoryList: Ref<Array<BillCategory>> = ref([]);
let isLoading: Ref<boolean> = ref(false);
let store = useStore();
onMounted(() => {
    isLoading.value = true;
    bookId.value = store.bookId;
    timestamp.value = Date.now();
    timestamp.value -= timestamp.value % (60 * 1000)
    assetName.value = "收款账户";
    store.selectedBillCategoryId = 0;
    getAllBillCategoryApi({bookId: bookId.value, type: "收入"}).then((res: BookAllBillCategoryResponse) => {
        billCategoryList.value = res.billCategoryList;
        getBookApi({id: bookId.value}).then((response: BookGetBookResponse) => {
            bookName.value = response.book.title;
            isLoading.value = false;
        }).catch(() => {
        });
    }).catch(() => {
    });
});
let assetList: Ref<Array<Asset>> = ref([]);
let showAssetDrawer: Ref<boolean> = ref(false);
let assetId: Ref<number> = ref(0);
let isAssetLoading: Ref<boolean> = ref(false);

function assetDrawerShower() {
    isAssetLoading.value = true;
    showAssetDrawer.value = true;
    getAllAsset().then((response: AssetGetAllAssetResponse) => {
        assetList.value = response.assetList;
        isAssetLoading.value = false;
    });
}

let assetSelector: Ref<string> = ref("");
watch(assetSelector, (value: string) => {
    if (value) {
        let asset: Asset | undefined = assetList.value.find(item => item.assetName === value);
        if (asset) {
            assetId.value = asset.id;
            assetName.value = asset.assetName;
            assetBalance.value = asset.balance;
            assetSvg.value = asset.svg;
        }
    }
});
let bookList: Ref<Array<Book>> = ref([]);
let showBookDrawer: Ref<boolean> = ref(false);
let bookSelector: Ref<string> = ref("");
let isBookLoading: Ref<boolean> = ref(false);

function bookDrawerShower() {
    isBookLoading.value = true;
    showBookDrawer.value = true;
    getAllBookApi().then((response: BookGetAllBookResponse) => {
        bookList.value = response.bookList;
        let bookTitle: string | undefined = bookList.value.find(item => item.id === bookId.value)?.title;
        if (bookTitle) {
            bookSelector.value = bookTitle;
        }
        isBookLoading.value = false;
    }).catch(() => {
    });
}

watch(bookSelector, (value: string) => {
    if (value) {
        let book: Book | undefined = bookList.value.find(item => item.title === value);
        if (book) {
            bookId.value = book.id;
            bookName.value = book.title;
        }
    }
});
let picture: File;
let fileName: Ref<string> = ref("");
const customRequest = (file: UploadCustomRequestOptions) => {
    picture = file.file.file as File;
    fileName.value = file.file.name;
};

function changePicture() {
    fileName.value = "";
}

declare const window: Window & { $message: any; URL: any };

function beforeUpload(data: { file: UploadFileInfo, fileList: UploadFileInfo[] }) {
    if (!data.file.file?.type.startsWith("image")) {
        window.$message.error("请上传图片");
        return false;
    }
    return true;
}

function addBill(): void {
    if (assetId.value === 0) {
        window.$message.error("请选择收款账户");
        return;
    }
    let formData: FormData = new FormData();
    formData.append("bookId", bookId.value as any);
    formData.append("inAssetId", assetId.value as any);
    formData.append("billCategoryId", store.selectedBillCategoryId as any);
    formData.append("type", "收入");
    formData.append("amount", amount.value as any);
    formData.append("time", intToString(timestamp.value) as any);
    formData.append("remark", remark.value as any);
    formData.append("file", picture as File);
    addBillApi(formData).then((_res: any) => {
        window.$message.success("添加成功");
        getAssetApi({id: assetId.value}).then((response: AssetGetAssetResponse) => {
            assetBalance.value = response.asset.balance;
        }).catch(() => {
        });
    }).catch(() => {
    });
}

let mouseOnClose: Ref<boolean> = ref(false);

let showUpdateModal: Ref<boolean> = ref(false);
const showIconPicker: Ref<boolean> = ref(false);
const iconPickerTarget: Ref<"add" | "edit"> = ref("add");

type BillCategoryType = "支出" | "收入";

const categoryTypeOptions = [
    {label: "支出", value: "支出"},
    {label: "收入", value: "收入"}
];

const addCategoryForm = ref<{ name: string; svg: string; type: BillCategoryType }>({
    name: "",
    svg: "",
    type: "收入"
});
const addCategoryLoading: Ref<boolean> = ref(false);
const isManageLoading: Ref<boolean> = ref(false);
const deletingCategoryId: Ref<number> = ref(0);
const editingCategoryId: Ref<number> = ref(0);
const editCategoryForm = ref<{ name: string; svg: string; type: BillCategoryType | null }>({
    name: "",
    svg: "",
    type: null
});
const editCategoryLoading: Ref<boolean> = ref(false);

function normalizeText(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
}

function resetAddForm(): void {
    addCategoryForm.value = {name: "", svg: "", type: "收入"};
}

function openCategoryManager(): void {
    showUpdateModal.value = true;
}

function openIconPicker(target: "add" | "edit"): void {
    iconPickerTarget.value = target;
    showIconPicker.value = true;
}

function handleIconSelected(iconName: string): void {
    if (iconPickerTarget.value === "add") {
        addCategoryForm.value.svg = iconName;
    } else {
        editCategoryForm.value.svg = iconName;
    }
}

async function refreshBillCategoryList(showMessage = false): Promise<void> {
    if (!bookId.value) return;
    isManageLoading.value = true;
    try {
        const res: BookAllBillCategoryResponse = await getAllBillCategoryApi({
            bookId: bookId.value,
            type: "收入"
        });
        billCategoryList.value = res.billCategoryList;
        if (!billCategoryList.value.find((item: BillCategory) => item.id === store.selectedBillCategoryId)) {
            store.selectedBillCategoryId = 0;
        }
        if (showMessage) {
            window.$message.success("已刷新分类");
        }
    } catch (_err) {
    } finally {
        isManageLoading.value = false;
    }
}

function startEditCategory(item: BillCategory): void {
    editingCategoryId.value = item.id;
    editCategoryForm.value = {
        name: "",
        svg: "",
        type: null
    };
}

function cancelEditCategory(): void {
    editingCategoryId.value = 0;
    editCategoryForm.value = {name: "", svg: "", type: null};
}

async function addCategory(): Promise<void> {
    const name = normalizeText(addCategoryForm.value.name);
    if (!name) {
        window.$message.error("请输入分类名称");
        return;
    }
    addCategoryLoading.value = true;
    try {
        await addBillCategoryApi({
            bookId: bookId.value,
            name,
            svg: normalizeText(addCategoryForm.value.svg) as any,
            type: addCategoryForm.value.type
        });
        window.$message.success("新增成功");
        resetAddForm();
        await refreshBillCategoryList();
    } catch (_err) {
    } finally {
        addCategoryLoading.value = false;
    }
}

async function applyEditCategory(item: BillCategory): Promise<void> {
    if (editingCategoryId.value !== item.id) return;
    editCategoryLoading.value = true;
    try {
        await updateBillCategoryApi({
            id: item.id,
            name: normalizeText(editCategoryForm.value.name) as any,
            svg: normalizeText(editCategoryForm.value.svg) as any,
            type: editCategoryForm.value.type ?? null,
            bookId: null
        } as any);
        window.$message.success("修改成功");
        cancelEditCategory();
        await refreshBillCategoryList();
    } catch (_err) {
    } finally {
        editCategoryLoading.value = false;
    }
}

async function deleteCategory(item: BillCategory): Promise<void> {
    if (deletingCategoryId.value === item.id) return;
    deletingCategoryId.value = item.id;
    try {
        await deleteBillCategoryApi({id: item.id});
        if (store.selectedBillCategoryId === item.id) {
            store.selectedBillCategoryId = 0;
        }
        window.$message.success("删除成功");
        await refreshBillCategoryList();
    } catch (_err) {
    } finally {
        deletingCategoryId.value = 0;
    }
}

watch(showUpdateModal, (value: boolean) => {
    if (value) {
        refreshBillCategoryList();
    } else {
        showIconPicker.value = false;
        cancelEditCategory();
        resetAddForm();
    }
});
</script>

<style scoped>
/* <style scoped> */
@media (max-width: 1023px) { /* Tailwind 的 lg 是 1024px 起 */
  .upload-mini-on-mobile :deep(.n-upload-file--image-card),
  .upload-mini-on-mobile :deep(.n-upload-trigger--image-card) {
    width: 56px;
    height: 56px;
  }

  /* 有些版本内部还会单独控制图片/图标容器，顺便限制一下 */
  .upload-mini-on-mobile :deep(.n-upload-file--image-card .n-upload-file__preview),
  .upload-mini-on-mobile :deep(.n-upload-trigger--image-card .n-upload-trigger__content) {
    width: 56px;
    height: 56px;
  }

  /* 让“图片”两个字别把卡片撑高/撑松 */
  .upload-mini-on-mobile :deep(.n-upload-trigger__text) {
    font-size: 12px;
    line-height: 1;
  }
}
</style>
