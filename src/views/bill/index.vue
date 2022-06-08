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
                <n-card class="rounded-xl" v-if="currentBill.id!==undefined">
                    <template #header>
                        <div class="flex space-x-3">
                            <div>
                                账单详情
                            </div>
                            <Icon v-bind:icon="iconMap[currentBill.type]" class="h-5 w-5 my-auto"
                                  v-bind:class="iconColorMap[currentBill.type]" />
                        </div>
                    </template>
                    <template #header-extra>
                        <div class="flex space-x-2 cursor-pointer" v-bind:class="{'text-primary':mouseOnEdit}"
                             v-on:mouseenter="mouseOnEditChange(true)"
                             v-on:mouseleave="mouseOnEditChange(false)" v-on:click="editingChange">
                            <div class="text-base">
                                {{ editing ? "完成" : "编辑" }}
                            </div>
                            <Icon class="my-auto h-5" icon="fluent:edit-48-regular">
                            </Icon>
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
                                <div class="space-y-2" v-if="currentBill.type === '支出' || currentBill.type === '收入'">
                                    <div class="text-lg my-auto">
                                        类别
                                    </div>
                                    <div class="h-10 flex items-center">
                                        <n-select v-model:value="currentBill.billCategory" v-if="editing"
                                                  v-bind:options="billCategoryList"
                                                  v-bind:render-label="cateSelectorRender" size="large" class="w-1/2">
                                        </n-select>
                                        <div v-if="!editing" class="flex space-x-2 items-center">
                                            <Icon class="h-5 w-5 text-primary"
                                                  v-bind:icon="billCategoryList.find(item => item.billCategoryName === currentBill.billCategory)?.svg">
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
                                        <n-select v-model:value="currentBill.payAsset" v-if="editing"
                                                  v-bind:options="assetList"
                                                  v-bind:render-label="assetSelectorRender" size="large" class="w-1/2">
                                        </n-select>
                                        <div v-if="!editing" class="flex space-x-2 items-center">
                                            <Icon class="h-5 w-5 text-primary"
                                                  v-bind:icon="assetList.find(item => item.assetName === currentBill.payAsset)?.svg">
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
                                        <n-select v-model:value="currentBill.incomeAsset" v-if="editing"
                                                  v-bind:options="assetList"
                                                  v-bind:render-label="assetSelectorRender" size="large" class="w-1/2">
                                        </n-select>
                                        <div v-if="!editing" class="flex space-x-2 items-center">
                                            <Icon class="h-5 w-5 text-primary"
                                                  v-bind:icon="assetList.find(item => item.assetName === currentBill.incomeAsset)?.svg">
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
                                            <n-select v-model:value="currentBill.outAsset" v-if="editing"
                                                      v-bind:options="assetList"
                                                      v-bind:render-label="assetSelectorRender" size="large">
                                            </n-select>
                                            <div v-if="!editing" class="flex space-x-2 items-center">
                                                <Icon class="h-5 w-5 text-primary"
                                                      v-bind:icon="assetList.find(item => item.assetName === currentBill.outAsset)?.svg">
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
                                            <n-select v-model:value="currentBill.inAsset" v-if="editing"
                                                      v-bind:options="assetList"
                                                      v-bind:render-label="assetSelectorRender" size="large">
                                            </n-select>
                                            <div v-if="!editing" class="flex space-x-2 items-center">
                                                <Icon class="h-5 w-5 text-primary"
                                                      v-bind:icon="assetList.find(item => item.assetName === currentBill.inAsset)?.svg">
                                                </Icon>
                                                <div class="text-15px">
                                                    {{ currentBill.inAsset }}
                                                </div>
                                            </div>
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
                                        <img v-if="imageSrc !== 'data:image;base64,null'" v-bind:src="imageSrc"
                                             alt="图片" />
                                        <n-empty v-if="imageSrc === 'data:image;base64,null'" class="w-1/2">
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
import { computed, ComputedRef, h, onMounted, Ref, ref, VNodeChild, watch } from "vue";
import {
    getAllAsset,
    getAllBillTimeApi,
    getBalanceMonthApi,
    getBillCategoryApi,
    getBillImageApi,
    getDayStatisticTimeApi,
    getIncomeMonthApi,
    getPayMonthApi
} from "@/apis";
import { useStore } from "@/stores/store";
import { dateToString, now, stringToInt } from "@/utils/dateComputer";
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
import { DayBillList } from "./components";
import { MonthStatistic } from "@/views/components";
import { Icon } from "@iconify/vue";
import { TimePickerProps } from "naive-ui";

let timePickerProps: TimePickerProps = { inputReadonly: true };
const store = useStore();
let bookId = ref<number>(0);

interface DayStatisticTime extends BillDayStatisticTimeResponse {
}

let dayStatisticTime: Ref<DayStatisticTime> = ref({ payStatistic: [], incomeStatistic: [] });

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

function getData() {
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
    store.currentBill = Object();
    imageSrc.value = "data:image;base64,null";
    editing.value = false;
    editTime.value = 0;
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
    getIncomeMonthApi({ bookId: bookId.value, month: startTime.value }).then((response: BookIncomeMonthResponse) => {
        incomeMonth.value = response.amount;
    });
}

let payMonth: Ref<number> = ref(0);

function getPayMonth(): void {
    getPayMonthApi({ bookId: bookId.value, month: startTime.value }).then((response: BookPayMonthResponse) => {
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
    console.log(timestamp);
    console.log(info);
}

function changeMonth(info: { year: number, month: number }): void {
    activeYear.value = info.year;
    activeMonth.value = info.month - 1;
    getData();
}

interface BillShow extends BillBillResponse {
    refunded?: boolean;
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
    currentBill.value = newValue;
    editing.value = false;
    editTime.value = stringToInt(newValue.billTime);
    imageSrc.value = "data:image;base64,null";
    if (!isNaN(currentBill.value.id)) {
        getBillImageApi({ billId: currentBill.value.id, type: currentBill.value.type }).then((response: any) => {
            imageSrc.value = "data:image;base64," + response;
        });
    }
});
let mouseOnEdit: Ref<boolean> = ref(false);

function mouseOnEditChange(value: boolean): void {
    mouseOnEdit.value = value;
}

let editing: Ref<boolean> = ref(false);

function editingChange(): void {
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
</script>
<style scoped>
</style>