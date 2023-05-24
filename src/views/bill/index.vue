<template>
    <div>
        <div class="flex space-x-5">
            <div class="w-7/20 space-y-5">
                <div class="flex space-x-3">
                    <div class="w-1/2">
                        <MonthStatistic v-bind:amount="balanceMonth" type="balance">
                        </MonthStatistic>
                    </div>
                    <div class="w-1/2 space-y-3">
                        <MonthStatistic v-bind:amount="payMonth" type="pay">
                        </MonthStatistic>
                        <MonthStatistic v-bind:amount="incomeMonth" type="income">
                        </MonthStatistic>
                    </div>
                </div>
                <div>
                    <n-card class="rounded-xl h-125">
                        <template #default>
                            <n-calendar @update:value="changeDay" @panel-change="changeMonth" class="h-105">
                                <template #header="{ year, month }">
                                    <div v-on:click="getAllBillMonth()" class="cursor-pointer">
                                        {{ year + " " + numberToCharMonth(month) }}
                                    </div>
                                </template>
                                <template #default="{ year, month, date }">
                                    <div v-html="calendarContent(year,month,date)"></div>
                                </template>
                            </n-calendar>
                        </template>
                    </n-card>
                </div>
            </div>
            <div class="w-3/10">
                <div>
                    <n-scrollbar class="h-185">
                        <DayBillList v-for="item in billDayList" v-bind:day="item[0]" v-bind:bill-list="item[1]"
                                     class="mb-3">
                        </DayBillList>
                    </n-scrollbar>
                </div>
            </div>
            <div class="w-7/20 space-y-5">
                <n-card class="rounded-xl" v-if="currentBill.id != undefined">
                    <template #header>
                        <div class="flex space-x-3">
                            <div>
                                账单详情
                            </div>
                            <Icon v-bind:icon="iconMap[currentBill.type]" class="h-5 w-5 my-auto"
                                  v-bind:class="iconColorMap[currentBill.type]"/>
                        </div>
                    </template>
                    <template #header-extra>
                        <div class="flex space-x-2">
                            <div class="flex space-x-2 cursor-pointer" v-bind:class="{'text-primary':mouseOnEdit}"
                                 v-on:mouseenter="mouseOnEditChange(true)"
                                 v-on:mouseleave="mouseOnEditChange(false)" v-on:click="editingChange">
                                <div class="text-base">
                                    {{ editing ? "完成" : "编辑" }}
                                </div>
                                <Icon class="my-auto h-5 w-5" icon="fluent:edit-48-regular">
                                </Icon>
                            </div>
                            <div class="flex space-x-2 cursor-pointer" v-if="currentBill.type==='支出'"
                                 v-bind:class="{'text-primary':mouseOnRefund}"
                                 v-on:mouseenter="mouseOnRefundChange(true)"
                                 v-on:mouseleave="mouseOnRefundChange(false)" v-on:click="refundChange">
                                <div class="text-base">
                                    退款
                                </div>
                                <Icon class="my-auto h-5 w-5" icon="ph:arrows-down-up">
                                </Icon>
                                <n-modal v-model:show="showRefundModal" class="w-1/7">
                                    <n-card>
                                        <template #header>
                                            <div class="s-title s-underline text-lg">提示</div>
                                        </template>
                                        <template #default>
                                            <div class="text-center space-y-8">
                                                <div class="mx-auto text-lg">确认退款？</div>
                                                <div class="flex space-x-2 justify-end">
                                                    <n-button v-on:click="refundBill">确定</n-button>
                                                    <n-button v-on:click="showRefundModal=false">取消</n-button>
                                                </div>
                                            </div>
                                        </template>
                                    </n-card>
                                </n-modal>
                            </div>
                            <div class="flex space-x-2 cursor-pointer" v-bind:class="{'text-primary':mouseOnDelete}"
                                 v-on:mouseenter="mouseOnDeleteChange(true)"
                                 v-on:mouseleave="mouseOnDeleteChange(false)" v-on:click="deleteChange">
                                <div class="text-base">
                                    删除
                                </div>
                                <Icon class="my-auto h-5 w-5" icon="material-symbols:delete-forever">
                                </Icon>
                                <n-modal v-model:show="showDeleteModal" class="w-1/7">
                                    <n-card>
                                        <template #header>
                                            <div class="s-title s-underline text-lg">提示</div>
                                        </template>
                                        <template #default>
                                            <div class="text-center space-y-8">
                                                <div class="mx-auto text-lg">确认删除？</div>
                                                <div class="flex space-x-2 justify-end">
                                                    <n-button v-on:click="deleteBill">确定</n-button>
                                                    <n-button v-on:click="showDeleteModal=false">取消</n-button>
                                                </div>
                                            </div>
                                        </template>
                                    </n-card>
                                </n-modal>
                            </div>
                        </div>
                    </template>
                    <template #default>
                        <n-scrollbar class="max-h-164">
                            <div class="space-y-3">
                                <div class="space-y-2">
                                    <div class="text-lg my-auto">
                                        金额
                                    </div>
                                    <div class="h-10 flex items-center">
                                        <n-input-number v-model:value="currentBill.amount" v-if="editing">
                                            <template #prefix>
                                                ￥
                                            </template>
                                        </n-input-number>
                                        <div v-if="!editing" class="text-15px">
                                            ￥{{ currentBill.amount }}
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-2"
                                     v-if="currentBill.type === '支出' || currentBill.type === '收入'">
                                    <div class="text-lg my-auto">
                                        类别
                                    </div>
                                    <div class="h-10 flex items-center">
                                        <n-select v-model:value="currentBill.billCategory as any" v-if="editing"
                                                  v-bind:options="billCategoryList"
                                                  v-bind:render-label="cateSelectorRender as any" size="large"
                                                  class="w-1/2">
                                        </n-select>
                                        <div v-if="!editing" class="flex space-x-2 items-center">
                                            <Icon class="h-5 w-5 text-primary"
                                                  v-bind:icon="billCategoryList.find(item => item.billCategoryName === currentBill.billCategory)?.svg as any">
                                            </Icon>
                                            <div class="text-15px">
                                                {{ currentBill.billCategory }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-2" v-if="currentBill.type==='支出'">
                                    <div class="text-lg my-auto">
                                        支出账户
                                    </div>
                                    <div class="h-10 flex items-center">
                                        <n-select v-model:value="currentBill.payAsset as any" v-if="editing"
                                                  v-bind:options="assetList"
                                                  v-bind:render-label="assetSelectorRender as any" size="large"
                                                  class="w-1/2">
                                        </n-select>
                                        <div v-if="!editing" class="flex space-x-2 items-center">
                                            <Icon class="h-5 w-5 text-primary"
                                                  v-bind:icon="assetList.find(item => item.assetName === currentBill.payAsset)?.svg as any">
                                            </Icon>
                                            <div class="text-15px">
                                                {{ currentBill.payAsset }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-2" v-if="currentBill.type==='收入'">
                                    <div class="text-lg my-auto">
                                        收入账户
                                    </div>
                                    <div class="h-10 flex items-center">
                                        <n-select v-model:value="currentBill.incomeAsset as any" v-if="editing"
                                                  v-bind:options="assetList"
                                                  v-bind:render-label="assetSelectorRender as any" size="large"
                                                  class="w-1/2">
                                        </n-select>
                                        <div v-if="!editing" class="flex space-x-2 items-center">
                                            <Icon class="h-5 w-5 text-primary"
                                                  v-bind:icon="assetList.find(item => item.assetName === currentBill.incomeAsset)?.svg as any">
                                            </Icon>
                                            <div class="text-15px">
                                                {{ currentBill.incomeAsset }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="space-x-2 flex" v-if="currentBill.type==='转账'">
                                    <div class="w-1/2 space-y-2">
                                        <div class="text-lg my-auto">
                                            转出账户
                                        </div>
                                        <div class="h-10 flex items-center">
                                            <n-select v-model:value="currentBill.outAsset as any" v-if="editing"
                                                      v-bind:options="assetList"
                                                      v-bind:render-label="assetSelectorRender as any" size="large">
                                            </n-select>
                                            <div v-if="!editing" class="flex space-x-2 items-center">
                                                <Icon class="h-5 w-5 text-primary"
                                                      v-bind:icon="assetList.find(item => item.assetName === currentBill.outAsset)?.svg as any">
                                                </Icon>
                                                <div class="text-15px">
                                                    {{ currentBill.outAsset }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="w-1/2 space-y-2">
                                        <div class="text-lg my-auto">
                                            转入账户
                                        </div>
                                        <div class="h-10 flex items-center">
                                            <n-select v-model:value="currentBill.inAsset as any" v-if="editing"
                                                      v-bind:options="assetList"
                                                      v-bind:render-label="assetSelectorRender as any" size="large">
                                            </n-select>
                                            <div v-if="!editing" class="flex space-x-2 items-center">
                                                <Icon class="h-5 w-5 text-primary"
                                                      v-bind:icon="assetList.find(item => item.assetName === currentBill.inAsset)?.svg as any">
                                                </Icon>
                                                <div class="text-15px">
                                                    {{ currentBill.inAsset }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-2" v-if="currentBill.type==='退款'">
                                    <div class="text-lg my-auto">
                                        退款账户
                                    </div>
                                    <div class="h-10 flex items-center">
                                        <n-select v-model:value="currentBill.refundAsset as any" v-if="editing"
                                                  v-bind:options="assetList"
                                                  v-bind:render-label="assetSelectorRender as any" size="large"
                                                  class="w-1/2">
                                        </n-select>
                                        <div v-if="!editing" class="flex space-x-2 items-center">
                                            <Icon class="h-5 w-5 text-primary"
                                                  v-bind:icon="assetList.find(item => item.assetName === currentBill.refundAsset)?.svg as any">
                                            </Icon>
                                            <div class="text-15px">
                                                {{ currentBill.refundAsset }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-2" v-if="currentBill.type==='转账'">
                                    <div class="text-lg my-auto">
                                        手续费
                                    </div>
                                    <div class="h-10 flex items-center">
                                        <n-input-number v-model:value="currentBill.transferFee as any" v-if="editing">
                                            <template #prefix>
                                                ￥
                                            </template>
                                        </n-input-number>
                                        <div v-if="!editing" class="text-15px">
                                            ￥{{ currentBill.transferFee }}
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <div class="text-lg my-auto">
                                        时间
                                    </div>
                                    <div class="h-10 flex items-center">
                                        <n-date-picker v-if="editing" v-model:value="editTime" class="w-1/2"
                                                       type="datetime" :input-readonly="true"
                                                       :time-picker-props="timePickerProps"
                                                       :update-value-on-close="true">
                                        </n-date-picker>
                                        <div v-if="!editing" class="text-15px">
                                            {{ currentBill.billTime }}
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <div class="text-lg my-auto">
                                        备注
                                    </div>
                                    <div class="h-10 flex items-center">
                                        <n-input v-if="editing" v-model:value="currentBill.remark" class="w-1/2"
                                                 size="large">
                                        </n-input>
                                        <div v-if="!editing" class="text-15px">
                                            {{ currentBill.remark }}
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <div class="text-lg my-auto">
                                        图片
                                    </div>
                                    <div>
                                        <div class="flex space-x-2" v-if="editing">
                                            <img v-if="imageSrc !== 'data:image;base64,null'"
                                                 v-bind:src="imageSrc"
                                                 alt="图片" class="rounded-xl h-24"/>
                                            <n-button class="my-auto" v-if="imageSrc !== 'data:image;base64,null'"
                                                      v-on:click="deleteImage">
                                                <template #default>
                                                    删除图片
                                                </template>
                                            </n-button>
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
                                        <img v-if="imageSrc !== 'data:image;base64,null' && !editing"
                                             v-bind:src="imageSrc"
                                             alt="图片" class="rounded-xl"/>
                                        <n-empty v-if="imageSrc === 'data:image;base64,null' && !editing" class="w-1/2">
                                            <template #default>
                                                什么也没有
                                            </template>
                                        </n-empty>
                                    </div>
                                </div>
                            </div>
                        </n-scrollbar>
                    </template>
                </n-card>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {computed, ComputedRef, h, onMounted, Ref, ref, VNodeChild, watch} from "vue";
import {
    addBillApi,
    changeBillApi,
    deleteBillApi,
    deleteBillImageApi,
    getAllAsset,
    getAllBillTimeApi,
    getBalanceMonthApi, getBillCategoryApi,
    getBillImageApi,
    getDayStatisticTimeApi,
    getIncomeMonthApi,
    getPayMonthApi
} from "@/apis";
import {useStore} from "@/stores/store";
import {dateToString, intToString, now, stringToInt} from "@/utils/dateComputer";
import {
    Asset,
    BillAllBillTimeResponse,
    BillBillResponse,
    BillCategory,
    BillDayStatisticTimeResponse,
    BookBalanceMonthResponse,
    BookIncomeMonthResponse,
    BookPayMonthResponse
} from "@/interface";
import {DayBillList} from "./components";
import {MonthStatistic} from "@/views/components";
import {Icon} from "@iconify/vue";
import {TimePickerProps, UploadCustomRequestOptions, UploadFileInfo} from "naive-ui";
import {AssetGetAllAssetResponse} from "@/interface";

let timePickerProps: TimePickerProps = {inputReadonly: true};
const store = useStore();
let bookId = ref<number>(0);

interface DayStatisticTime extends BillDayStatisticTimeResponse {
}

let dayStatisticTime: Ref<DayStatisticTime> = ref({payStatistic: [], incomeStatistic: []});

interface BillCategoryShow extends BillCategory {
    value: string;
    label: string;
}

interface AssetShow extends Asset {
    value: string;
    label: string;
}

let billCategoryList: Ref<Array<BillCategoryShow>> = ref([]);
let assetList: Ref<Array<AssetShow>> = ref([]);
const iconMap = {
    "支出": "material-symbols:arrow-upward",
    "收入": "material-symbols:arrow-downward",
    "转账": "ph:arrows-clockwise",
    "退款": "ph:arrows-down-up"
};
const iconColorMap = {
    "支出": "text-red-500",
    "收入": "text-green-500",
    "转账": "text-blue-500",
    "退款": "text-blue-500"
};

function getData(refresh: boolean = true) {
    getBalanceMonth();
    getIncomeMonth();
    getPayMonth();
    getAllBillMonth();
    getDayStatisticTimeApi({
        bookId: bookId.value,
        startTime: startTime.value,
        endTime: endTime.value
    }).then((response: BillDayStatisticTimeResponse) => {
        dayStatisticTime.value = response;
    }).catch(() => {
    });
    getBillCategoryApi({
        bookId: bookId.value
    }).then((response: any) => {
        billCategoryList.value = response;
        billCategoryList.value.forEach((item: BillCategoryShow) => {
            item.value = item.billCategoryName;
            item.label = item.billCategoryName;
        });
    }).catch(() => {
    });
    getAllAsset().then((response: any) => {
        assetList.value = response.assetList;
        assetList.value.forEach((item: AssetShow) => {
            item.value = item.assetName;
            item.label = item.assetName;
        });
    }).catch(() => {
    });
    if (refresh) {
        store.currentBill = Object();
        imageSrc.value = "data:image;base64,null";
        editTime.value = 0;
    }
    editing.value = false;
}

onMounted(() => {
    bookId.value = store.bookId;
    if (bookId.value !== 0) {
        getData();
    }
});
watch(() => store.bookId, (newValue: number) => {
    bookId.value = newValue;
    if (bookId.value !== 0) {
        getData();
    }
});
let activeYear: Ref<number> = ref(now().getFullYear());
let activeMonth: Ref<number> = ref(now().getMonth());
let days: ComputedRef<Array<number>> = computed(() => {
    let days: Array<number> = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (activeYear.value % 4 === 0 && activeYear.value % 100 !== 0 || activeYear.value % 400 === 0) {
        days[1] = 29;
    }
    return days;
});
let startTime: ComputedRef<string> = computed(() => {
    return dateToString(new Date(activeYear.value, activeMonth.value, 1, 0, 0, 0));
});
let endTime: ComputedRef<string> = computed(() => {
    return dateToString(new Date(activeYear.value, activeMonth.value, days.value[activeMonth.value], 23, 59, 59));
});
let balanceMonth: Ref<number> = ref(0);

function getBalanceMonth(): void {
    getBalanceMonthApi({
        bookId: bookId.value,
        month: startTime.value
    }).then((bookBalanceMonthResponse: BookBalanceMonthResponse) => {
        balanceMonth.value = bookBalanceMonthResponse.amount;
    });
}

let incomeMonth: Ref<number> = ref(0);

function getIncomeMonth(): void {
    getIncomeMonthApi({bookId: bookId.value, month: startTime.value}).then((response: BookIncomeMonthResponse) => {
        incomeMonth.value = response.amount;
    });
}

let payMonth: Ref<number> = ref(0);

function getPayMonth(): void {
    getPayMonthApi({bookId: bookId.value, month: startTime.value}).then((response: BookPayMonthResponse) => {
        payMonth.value = response.amount;
    });
}

function calendarContent(year: number, month: number, day: number): string {
    let content: string = "";
    content += `<div class="text-red-500 text-xs">`;
    dayStatisticTime.value.payStatistic.forEach((item: { day: string, amount: number }) => {
        if (item.day === dateToString(new Date(year, month - 1, day))) {
            content += `-${item.amount >= 10000 ? Math.round(item.amount / 1000) / 10 + "万" : item.amount}`;
        }
    });
    content += `</div>`;
    content += `<div class="text-green-500 text-xs">`;
    dayStatisticTime.value.incomeStatistic.forEach((item: { day: string, amount: number }) => {
        if (item.day === dateToString(new Date(year, month - 1, day))) {
            content += `-${item.amount >= 10000 ? Math.round(item.amount / 1000) / 10 + "万" : item.amount}`;
        }
    });
    content += `</div>`;
    return content;
}

function changeDay(timestamp: number, info: { year: number, month: number, date: number }): void {
    let newStartTime = String(info.year) + "-" + String(info.month) + "-" + String(info.date) + " 00:00:00";
    let newEndTime = String(info.year) + "-" + String(info.month) + "-" + String(info.date) + " 23:59:59";
    getAllBillTimeApi({
        bookId: bookId.value,
        startTime: newStartTime,
        endTime: newEndTime
    }).then((response: BillAllBillTimeResponse) => {
        billList.value = response.billList;
    });
}

function changeMonth(info: { year: number, month: number }): void {
    activeYear.value = info.year;
    activeMonth.value = info.month - 1;
    getData();
}

interface BillShow extends BillBillResponse {
}

let billList: Ref<Array<BillShow>> = ref([]);

function getAllBillMonth(): void {
    getAllBillTimeApi({
        bookId: bookId.value,
        startTime: startTime.value,
        endTime: endTime.value
    }).then((response: BillAllBillTimeResponse) => {
        billList.value = response.billList;
    });
}

let billDayList: ComputedRef<Map<string, Array<BillShow>>> = computed(() => {
    let dayMap: Map<string, Array<BillShow>> = new Map();
    billList.value.forEach((item: BillShow) => {
        let day: string = item.billTime.substring(0, 10);
        if (dayMap.has(day)) {
            dayMap.get(day)?.push(item);
        } else {
            dayMap.set(day, [item]);
        }
    });
    return dayMap;
});
let currentBill: Ref<BillShow> = ref({} as BillShow);
let imageSrc: Ref<string> = ref("data:image;base64,null");
watch(() => store.currentBill, (newValue: BillShow) => {
    currentBill.value.amount = newValue.amount;
    currentBill.value.billTime = newValue.billTime;
    currentBill.value.payAsset = newValue.payAsset;
    currentBill.value.billCategory = newValue.billCategory;
    currentBill.value.incomeAsset = newValue.incomeAsset;
    currentBill.value.inAsset = newValue.inAsset;
    currentBill.value.outAsset = newValue.outAsset;
    currentBill.value.transferFee = newValue.transferFee;
    currentBill.value.payBillId = newValue.payBillId;
    currentBill.value.refundAsset = newValue.refundAsset;
    currentBill.value.id = newValue.id;
    currentBill.value.remark = newValue.remark;
    currentBill.value.refunded = newValue.refunded;
    currentBill.value.type = newValue.type;
    editing.value = false;
    editTime.value = stringToInt(newValue.billTime);
    imageSrc.value = "data:image;base64,null";
    if (!isNaN(currentBill.value.id)) {
        getBillImageApi({billId: currentBill.value.id, type: currentBill.value.type}).then((response: any) => {
            imageSrc.value = "data:image;base64," + response;
        });
    }
});
let mouseOnEdit: Ref<boolean> = ref(false);
let mouseOnRefund: Ref<boolean> = ref(false);

function mouseOnEditChange(value: boolean): void {
    mouseOnEdit.value = value;
}

function mouseOnRefundChange(value: boolean): void {
    mouseOnRefund.value = value;
}

let showRefundModal: Ref<boolean> = ref(false);

function refundChange() {
    showRefundModal.value = !showRefundModal.value;
}

function refundBill() {
    if (currentBill.value.type !== "支出") {
        return;
    }
    getAllAsset().then((response: AssetGetAllAssetResponse) => {
        let inAsset: number = 0;
        response.assetList.forEach((item) => {
            if (item.assetName === currentBill.value.payAsset) {
                inAsset = item.id;
            }
        });
        getBillCategoryApi({bookId: bookId.value}).then((subResponse: any) => {
            let billCategoryId: number = 0;
            subResponse.forEach((item: { billCategoryName: string | undefined; id: number; }) => {
                if (item.billCategoryName === currentBill.value.billCategory) {
                    billCategoryId = item.id;
                }
            });
            let formData: FormData = new FormData();
            formData.append("bookId", bookId.value.toString());
            formData.append("inAssetId", inAsset.toString());
            formData.append("payBillId", currentBill.value.id.toString());
            formData.append("type", "退款");
            formData.append("amount", currentBill.value.amount.toString());
            formData.append("time", dateToString(now()));
            formData.append("remark", "退款");
            formData.append("billCategoryId", billCategoryId.toString());
            addBillApi(formData).then(() => {
                window.$message.success("退款成功");
                getData();
                refundChange();
            }).catch(() => {
            });
        }).catch(() => {
        });
    }).catch(() => {
    });

}

let editing: Ref<boolean> = ref(false);

function editingChange(): void {
    if (editing.value) {
        let changed: boolean = false;
        let formData: FormData = new FormData();
        formData.append("id", currentBill.value.id as any);
        switch (currentBill.value.type) {
            case "支出":
                if (currentBill.value.payAsset !== store.currentBill.payAsset) {
                    console.log(currentBill.value.payAsset);
                    console.log(assetList.value);
                    formData.append("outAssetId", assetList.value.find((item: Asset) => item.assetName === currentBill.value.payAsset)?.id as any);
                    changed = true;
                }
                if (currentBill.value.billCategory !== store.currentBill.billCategory) {
                    formData.append("billCategoryId",
                        billCategoryList.value.find((item: BillCategory) => item.billCategoryName === currentBill.value.billCategory)?.id as any);
                    changed = true;
                }
                if (currentBill.value.amount !== store.currentBill.amount) {
                    formData.append("amount", currentBill.value.amount as any);
                    changed = true;
                }
                if (intToString(editTime.value) !== store.currentBill.billTime) {
                    formData.append("billTime", intToString(editTime.value) as any);
                    changed = true;
                }
                if (currentBill.value.remark !== store.currentBill.remark) {
                    formData.append("remark", currentBill.value.remark as any);
                    changed = true;
                }
                if (picture !== undefined) {
                    formData.append("file", picture as File);
                    changed = true;
                }
                formData.append("type", "支出");
                break;
            case "收入":
                if (currentBill.value.incomeAsset !== store.currentBill.incomeAsset) {
                    formData.append("inAssetId", assetList.value.find((item: Asset) => item.assetName === currentBill.value.incomeAsset)?.id as any);
                    changed = true;
                }
                if (currentBill.value.billCategory !== store.currentBill.billCategory) {
                    formData.append("billCategoryId",
                        billCategoryList.value.find((item: BillCategory) => item.billCategoryName === currentBill.value.billCategory)?.id as any);
                    changed = true;
                }
                if (currentBill.value.amount !== store.currentBill.amount) {
                    formData.append("amount", currentBill.value.amount as any);
                    changed = true;
                }
                if (intToString(editTime.value) !== store.currentBill.billTime) {
                    formData.append("billTime", intToString(editTime.value) as any);
                    changed = true;
                }
                if (currentBill.value.remark !== store.currentBill.remark) {
                    formData.append("remark", currentBill.value.remark as any);
                }
                if (picture !== undefined) {
                    formData.append("file", picture as File);
                    changed = true;
                }
                formData.append("type", "收入");
                break;
            case "转账":
                if (currentBill.value.inAsset !== store.currentBill.incomeAsset) {
                    formData.append("inAssetId", assetList.value.find((item: Asset) => item.assetName === currentBill.value.inAsset)?.id as any);
                    changed = true;
                }
                if (currentBill.value.outAsset !== store.currentBill.payAsset) {
                    formData.append("outAssetId", assetList.value.find((item: Asset) => item.assetName === currentBill.value.outAsset)?.id as any);
                    changed = true;
                }
                if (currentBill.value.amount !== store.currentBill.amount) {
                    formData.append("amount", currentBill.value.amount as any);
                    changed = true;
                }
                if (currentBill.value.transferFee !== store.currentBill.transferFee) {
                    formData.append("transferFee", currentBill.value.transferFee as any);
                    changed = true;
                }
                if (intToString(editTime.value) !== store.currentBill.billTime) {
                    formData.append("billTime", intToString(editTime.value) as any);
                    changed = true;
                }
                if (currentBill.value.remark !== store.currentBill.remark) {
                    formData.append("remark", currentBill.value.remark as any);
                    changed = true;
                }
                if (picture !== undefined) {
                    formData.append("file", picture as File);
                    changed = true;
                }
                formData.append("type", "转账");
                break;
            case "退款":
                if (currentBill.value.payBillId !== store.currentBill.payBillId) {
                    formData.append("payBillId", currentBill.value.payBillId as any);
                    changed = true;
                }
                if (currentBill.value.refundAsset !== store.currentBill.refundAsset) {
                    formData.append("inAssetId", assetList.value.find((item: Asset) => item.assetName === currentBill.value.refundAsset)?.id as any);
                    changed = true;
                }
                if (currentBill.value.amount !== store.currentBill.amount) {
                    formData.append("amount", currentBill.value.amount as any);
                    changed = true;
                }
                if (intToString(editTime.value) !== store.currentBill.billTime) {
                    formData.append("billTime", intToString(editTime.value) as any);
                    changed = true;
                }
                if (currentBill.value.remark !== store.currentBill.remark) {
                    formData.append("remark", currentBill.value.remark as any);
                    changed = true;
                }
                if (picture !== undefined) {
                    formData.append("file", picture as File);
                    changed = true;
                }
                formData.append("type", "退款");
                break;
        }
        if (changed) {
            changeBillApi(formData).then(() => {
                window.$message.success("修改成功");
                getData(false);
                getBillImageApi({
                    billId: currentBill.value.id,
                    type: currentBill.value.type
                }).then((response: any) => {
                    imageSrc.value = "data:image;base64," + response;
                });
            }).catch(() => {
            });
        }
    }
    editing.value = !editing.value;
}

function cateSelectorRender(option: BillCategoryShow): VNodeChild {
    return h(
        "div",
        {
            class: "flex space-x-2"
        },
        {
            default: () => [
                h(
                    Icon,
                    {
                        class: "h-5 w-5 text-primary",
                        icon: option.svg
                    }
                ),
                h(
                    "div",
                    {},
                    {
                        default: () => option.label
                    }
                )
            ]
        });
}

function assetSelectorRender(option: AssetShow): VNodeChild {
    return h(
        "div",
        {
            class: "flex space-x-2"
        },
        {
            default: () => [
                h(
                    Icon,
                    {
                        class: "h-5 w-5 text-primary",
                        icon: option.svg
                    }
                ),
                h(
                    "div",
                    {},
                    {
                        default: () => option.label
                    }
                )
            ]
        });
}

let editTime: Ref<number> = ref(0);
let picture: File | undefined;
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

let mouseOnDelete: Ref<boolean> = ref(false);

function mouseOnDeleteChange(value: boolean): void {
    mouseOnDelete.value = value;
}

let showDeleteModal: Ref<boolean> = ref(false);

function deleteChange() {
    showDeleteModal.value = !showDeleteModal.value;
}

function deleteBill() {
    deleteBillApi({
        id: currentBill.value.id,
        type: currentBill.value.type
    }).then(() => {
        window.$message.success("删除成功");
        getData();
        deleteChange();
    }).catch(() => {
    });
}

function deleteImage(): void {
    deleteBillImageApi({
        id: currentBill.value.id,
        type: currentBill.value.type
    }).then(() => {
        window.$message.success("删除成功");
        getData(false);
    }).catch(() => {
    });
}

function numberToCharMonth(numberMonth: number): string {
    let charList: Array<string> = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
    return charList[numberMonth - 1] + "月";
}
</script>
<style scoped>
</style>