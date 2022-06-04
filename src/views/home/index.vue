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
                    <n-card class="rounded-xl">
                        <template #header>
                            <div>收支分布</div>
                        </template>
                        <template #default>
                            <n-tabs type="line" animated="true" @update:value="refresh">
                                <n-tab-pane name="支出" tab="支出">
                                    <div ref="payChartRef" class="h-80">
                                    </div>
                                </n-tab-pane>
                                <n-tab-pane name="收入" tab="收入">
                                    <div ref="incomeChartRef" class="h-80">
                                    </div>
                                </n-tab-pane>
                            </n-tabs>
                        </template>
                    </n-card>
                </div>
            </div>
            <div class="w-7/20 space-y-5">
                <div>
                    <n-card class="rounded-xl h-140">
                        <template #default>
                            <n-calendar @update:value="changeDay" @panel-change="changeMonth" class="h-120">
                                <template #default="{ year, month, date }">
                                    <div v-html="calendarContent(year,month,date)"></div>
                                </template>
                            </n-calendar>
                        </template>
                    </n-card>
                </div>
            </div>
            <div class="w-3/10 space-y-5">
                <div>
                    <n-scrollbar class="h-180">
                        <DayBillList v-for="item in billDayList" v-bind:day="item[0]" v-bind:bill-list="item[1]"
                                     class="mb-3">
                        </DayBillList>
                    </n-scrollbar>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed, ComputedRef, nextTick, onMounted, Ref, ref, watch } from "vue";
import { getBalanceMonthApi, getIncomeMonthApi, getPayMonthApi } from "@/apis/book";
import { useStore } from "@/stores/store";
import { dateToString, now } from "@/utils/dateComputer";
import {
    BillAllBillTimeResponse,
    BillBillResponse,
    BillDayStatisticTimeResponse,
    BookBalanceMonthResponse,
    BookIncomeMonthResponse,
    BookPayMonthResponse
} from "@/interface";
import { DayBillList, MonthStatistic } from "./components";
import * as echarts from "echarts";
import { getAllBillTimeApi, getDayStatisticTimeApi } from "@/apis";

function refresh(value: string): void {
    nextTick(() => {
        nextTick(() => {
            initLineChart(value === "支出" ? "支出" : "收入");
        });
    });
}

let store = useStore();
let bookId = ref<number>(0);

interface DayStatisticTime extends BillDayStatisticTimeResponse {
}

let dayStatisticTime: Ref<DayStatisticTime> = ref({ payStatistic: [], incomeStatistic: [] });
onMounted(() => {
    bookId.value = store.bookId;
    if (bookId.value !== 0) {
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
            initLineChart("支出");
        }).catch(() => {
        });
    }
});
watch(() => store.bookId, (newValue: number) => {
    bookId.value = newValue;
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
        nextTick(() => {
            initLineChart("支出");
        });
    }).catch(() => {
    });
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

let payChartRef: Ref<HTMLElement | undefined> = ref();
let incomeChartRef: Ref<HTMLElement | undefined> = ref();


function initLineChart(type: "支出" | "收入"): void {
    if ((type === "支出" ? payChartRef.value : incomeChartRef.value) === undefined) {
        return;
    }
    let lineChart = echarts.init((type === "支出" ? payChartRef.value : incomeChartRef.value) as HTMLElement);
    let xData: Array<string> = [];
    for (let i = 1; i <= days.value[activeMonth.value]; i++) {
        xData.push(i.toString());
    }
    let lineData: Array<number> = [];
    let maxNum = 0;
    let minNum = 0;
    (type === "支出" ? dayStatisticTime.value.payStatistic : dayStatisticTime.value.incomeStatistic).forEach((item: { day: string, amount: number }) => {
        lineData.push(item.amount);
        if (item.amount > maxNum) {
            maxNum = item.amount;
        }
        if (item.amount < minNum) {
            minNum = item.amount;
        }
    });
    let option = {
        xAxis: {
            type: "category",
            data: xData
        },
        yAxis: {
            type: "value",
            name: `最大一笔：${maxNum} 最小一笔：${minNum}`,
            nameGap: 20,
            nameTextStyle: {
                padding: [0, 0, 0, 100]
            }
        },
        tooltip: {
            show: true
        },
        series: [
            {
                data: lineData,
                type: "bar",
                barWidth: "12",
                color: type === "支出" ? "red" : "green"
            }
        ]
    };
    lineChart.setOption(option);
    window.onresize = function() {
        lineChart.resize();
    };
}

function calendarContent(year: number, month: number, day: number): string {
    let content: string = "";
    content += `<div class="text-red-500 text-xs">`;
    dayStatisticTime.value.payStatistic.forEach((item: { day: string, amount: number }) => {
        if (item.day === dateToString(new Date(year, month - 1, day))) {
            content += `-${item.amount}`;
        }
    });
    content += `</div>`;
    content += `<div class="text-green-500 text-xs">`;
    dayStatisticTime.value.incomeStatistic.forEach((item: { day: string, amount: number }) => {
        if (item.day === dateToString(new Date(year, month - 1, day))) {
            content += `+${item.amount}`;
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
        nextTick(() => {
            initLineChart("支出");
        });
    }).catch(() => {
    });
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
</script>
<style scoped>
</style>
