<template>
    <div>
        <div class="space-y-10">
            <n-scrollbar class="h-20 lg:h-70">
                <n-spin v-if="isLoading" class="flex items-center h-20 lg:h-70"></n-spin>
                <div class="grid grid-cols-5 lg:grid-cols-10 gap-4">
                    <BillCategoryItem v-for="item in billCategoryList" :billCategory="item"></BillCategoryItem>
                </div>
            </n-scrollbar>
            <div class="space-y-2">
                <div class="lg:flex lg:space-x-2 space-y-2 lg:space-y-0">
                    <div class="w-full lg:w-2/3">
                        <n-input v-model:value="remark" placeholder="点此输入备注" type="text"/>
                    </div>
                    <div class="w-full lg:w-1/3">
                        <n-input-number v-model:value="amount" step="0.01">
                            <template #prefix>
                                ￥
                            </template>
                        </n-input-number>
                    </div>
                </div>
                <div class="lg:flex lg:space-x-2 space-y-2 lg:space-y-0">
                    <div class="lg:w-1/3">
                        <n-button class="w-full truncate" v-on:click="bookDrawerShower">
                            <template #default>
                                <n-spin v-if="isLoading" class="items-center h-4 w-4"></n-spin>
                                <div v-if="!isLoading" class="text-left">
                                    {{ bookName }}
                                </div>
                            </template>
                        </n-button>
                    </div>
                    <div class="lg:w-1/3">
                        <n-button class="w-full truncate" v-on:click="assetDrawerShower">
                            <template #default>
                                <div class="flex space-x-2">
                                    <div v-if="assetName!=='支付账户'">
                                        <Icon :icon="assetSvg" class="text-primary w-4 h-4"/>
                                    </div>
                                    <div class="m-auto">
                                        {{ assetName }}
                                    </div>
                                    <div v-if="assetName!=='支付账户'" class="m-auto">
                                        ￥{{ assetBalance }}
                                    </div>
                                </div>
                            </template>
                        </n-button>
                    </div>
                    <div class="lg:w-1/3">
                        <n-date-picker v-model:value="timestamp" :input-readonly="true" placement="top-start"
                                       type="datetime" :update-value-on-close="true"
                                       :time-picker-props="timePickerProps"/>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <n-upload :custom-request="customRequest" class="w-1/5"
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
                        选择支付账户
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
import {addBillApi, getAllAsset, getAllBillCategoryApi, getAllBookApi, getAssetApi, getBookApi} from "@/apis";
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
    assetName.value = "支付账户";
    store.selectedBillCategoryId = 0;
    getAllBillCategoryApi({bookId: bookId.value, type: "支出"}).then((res: BookAllBillCategoryResponse) => {
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
        window.$message.error("请选择支付账户");
        return;
    }
    let formData: FormData = new FormData();
    formData.append("bookId", bookId.value as any);
    formData.append("outAssetId", assetId.value as any);
    formData.append("billCategoryId", store.selectedBillCategoryId as any);
    formData.append("type", "支出");
    formData.append("amount", amount.value as any);
    formData.append("time", intToString(timestamp.value) as any);
    formData.append("remark", remark.value as any);
    formData.append("refunded", false as any);
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
</script>

<style scoped>

</style>
