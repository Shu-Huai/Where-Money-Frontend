<template>
    <div>
        <div class="xl:flex xl:space-x-5 space-y-5 xl:space-y-0">
            <div class="xl:w-7/20 space-y-5">
                <div class="xl:flex xl:space-x-3 space-y-3 xl:space-y-0">
                    <div class="xl:w-1/2">
                        <MonthStatistic v-bind:amount="balanceMonth" type="balance">
                        </MonthStatistic>
                    </div>
                    <div class="xl:w-1/2 space-y-3">
                        <MonthStatistic v-bind:amount="payMonth" type="pay">
                        </MonthStatistic>
                        <MonthStatistic v-bind:amount="incomeMonth" type="income">
                        </MonthStatistic>
                    </div>
                </div>
                <n-card class="rounded-xl h-165 xl:h-135">
                    <template #default>
                        <n-calendar @panel-change="changeMonth" class="h-145 xl:h-115">
                            <template #default="{ year, month, date }">
                                <div v-html="calendarContent(year,month,date)"></div>
                            </template>
                        </n-calendar>
                    </template>
                </n-card>
            </div>
            <div class="xl:w-7/20 space-y-5">
                <div>
                    <n-card class="rounded-xl">
                        <template #header>
                            <div>收支分布</div>
                        </template>
                        <template #default>
                            <n-tabs type="line" :animated="true" @update:value="refreshLine" v-model:value="lineSwitch">
                                <n-tab-pane name="支出" tab="支出">
                                    <div ref="payDayRef" class="h-80">
                                    </div>
                                </n-tab-pane>
                                <n-tab-pane name="收入" tab="收入">
                                    <div ref="incomeDayRef" class="h-80">
                                    </div>
                                </n-tab-pane>
                            </n-tabs>
                        </template>
                    </n-card>
                </div>
                <n-card class="rounded-xl w-full">
                    <template #default>
                        <div class="flex space-x-3">
                            <n-statistic class="w-1/2">
                                <template #label>
                                    日均支出
                                </template>
                                <template #prefix>
                                    ￥
                                </template>
                                <template #default>
                                    {{ dayPayAverage }}
                                </template>
                            </n-statistic>
                            <n-statistic class="w-1/2">
                                <template #label>
                                    日均收入
                                </template>
                                <template #prefix>
                                    ￥
                                </template>
                                <template #default>
                                    {{ dayIncomeAverage }}
                                </template>
                            </n-statistic>
                        </div>
                    </template>
                </n-card>
                <n-card class="rounded-xl">
                    <n-scrollbar class="max-h-120">
                        <n-data-table :columns="dayColumns" :data="dayData">
                        </n-data-table>
                    </n-scrollbar>
                </n-card>
            </div>
            <div class="xl:w-3/10 space-y-5">
                <n-card class="rounded-xl">
                    <template #header>
                        <div>分类统计</div>
                    </template>
                    <template #default>
                        <n-tabs type="line" :animated="true" @update:value="refreshPie" v-model:value="pieSwitch">
                            <n-tab-pane name="支出" tab="支出">
                                <div ref="payCateRef" class="h-80">
                                </div>
                            </n-tab-pane>
                            <n-tab-pane name="收入" tab="收入">
                                <div ref="incomeCateRef" class="h-80">
                                </div>
                            </n-tab-pane>
                        </n-tabs>
                    </template>
                </n-card>
                <n-card class="rounded-xl">
                    <n-scrollbar class="max-h-120">
                        <n-data-table :columns="cateColumns" :data="cateData">
                        </n-data-table>
                    </n-scrollbar>
                </n-card>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed, ComputedRef, h, nextTick, onMounted, Ref, ref, watch } from "vue";
import { getBalanceMonthApi, getIncomeMonthApi, getPayMonthApi } from "@/apis/book";
import { useStore } from "@/stores/store";
import { dateToString, now } from "@/utils/dateComputer";
import { Icon } from "@iconify/vue";
import {
    BillCategory,
    BillDayStatisticTimeResponse,
    BillMaxMinTimeResponse,
    BookBalanceMonthResponse,
    BookIncomeMonthResponse,
    BookPayMonthResponse
} from "@/interface";
import { MonthStatistic } from "@/views/components";
import * as echarts from "echarts";
import {
    getBillCategoryApi,
    getCategoryStatisticTimeApi,
    getDayStatisticTimeApi,
    getMaxMinIncomeTimeApi,
    getMaxMinPayTimeApi
} from "@/apis";
import { BillCategoryStatisticTimeResponse } from "@/interface/response/bill/BillCategoryStatisticTimeResponse";
import { useThemeStore } from "@/store";

const themeStore = useThemeStore();
const store = useStore();
let bookId = ref<number>(0);

interface DayStatisticTime extends BillDayStatisticTimeResponse {
}

interface CategoryStatisticTime extends BillCategoryStatisticTimeResponse {
}

let dayStatisticTime: Ref<DayStatisticTime> = ref({ payStatistic: [], incomeStatistic: [] });
let categoryStatisticTime: Ref<CategoryStatisticTime> = ref({ payStatistic: [], incomeStatistic: [] });
let lineSwitch: Ref<"支出" | "收入"> = ref("支出");
let pieSwitch: Ref<"支出" | "收入"> = ref("支出");
let maxPay: Ref<number> = ref(0);
let minPay: Ref<number> = ref(0);
let maxIncome: Ref<number> = ref(0);
let minIncome: Ref<number> = ref(0);

function getData() {
    getBalanceMonth();
    getIncomeMonth();
    getPayMonth();
    getDayStatisticTimeApi({
        bookId: bookId.value,
        startTime: startTime.value,
        endTime: endTime.value
    }).then((response: BillDayStatisticTimeResponse) => {
        dayStatisticTime.value = response;
        getMaxMinPayTimeApi({
            bookId: bookId.value,
            startTime: startTime.value,
            endTime: endTime.value
        }).then((response: BillMaxMinTimeResponse) => {
            maxPay.value = response.max.amount;
            minPay.value = response.min.amount;
            getMaxMinIncomeTimeApi({
                bookId: bookId.value,
                startTime: startTime.value,
                endTime: endTime.value
            }).then((response: BillMaxMinTimeResponse) => {
                maxIncome.value = response.max.amount;
                minIncome.value = response.min.amount;
                nextTick(() => {
                    initLineChart(lineSwitch.value);
                });
            }).catch(() => {
            });
        }).catch(() => {
        });
    }).catch(() => {
    });
    getCategoryStatisticTimeApi({
        bookId: bookId.value,
        startTime: startTime.value,
        endTime: endTime.value
    }).then((response: BillCategoryStatisticTimeResponse) => {
        categoryStatisticTime.value = response;
        nextTick(() => {
            initPieChart(pieSwitch.value);
        });
    }).catch(() => {
    });
}

let billCategory: Ref<Array<BillCategory>> = ref([]);

onMounted(() => {
    bookId.value = store.bookId;
    if (bookId.value !== 0) {
        getData();
        getBillCategoryApi({ bookId: bookId.value }).then((res: any) => {
            billCategory.value = res;
        }).catch(() => {
        });
    }
});
watch(() => store.bookId, (newValue: number) => {
    bookId.value = newValue;
    if (bookId.value !== 0) {
        getData();
        getBillCategoryApi({ bookId: bookId.value }).then((res: any) => {
            billCategory.value = res;
        }).catch(() => {
        });
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

let payDayRef: Ref<HTMLElement | undefined> = ref();
let incomeDayRef: Ref<HTMLElement | undefined> = ref();

function initLineChart(type: "支出" | "收入"): void {
    if ((type === "支出" ? payDayRef.value : incomeDayRef.value) === undefined) {
        return;
    }
    let lineChart = echarts.init((type === "支出" ? payDayRef.value : incomeDayRef.value) as HTMLElement);
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
            name: `最大一笔：${type === "支出" ? maxPay.value : maxIncome.value} 最小一笔：${type === "支出" ? minPay.value : minIncome.value}`,
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
                color: type === "支出" ? "red" : "green"
            }
        ]
    };
    lineChart.setOption(option);
    charts.push(lineChart);
}

function refreshLine(value: string): void {
    nextTick(() => {
        nextTick(() => {
            initLineChart(value === "支出" ? "支出" : "收入");
        });
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
            content += `+${item.amount >= 10000 ? Math.round(item.amount / 1000) / 10 + "万" : item.amount}`;
        }
    });
    content += `</div>`;
    return content;
}

function changeMonth(info: { year: number, month: number }): void {
    activeYear.value = info.year;
    activeMonth.value = info.month - 1;
    getData();
}

let payCateRef: Ref<HTMLElement | undefined> = ref();
let incomeCateRef: Ref<HTMLElement | undefined> = ref();

function initPieChart(type: "支出" | "收入"): void {
    if ((type === "支出" ? payCateRef.value : incomeCateRef.value) === undefined) {
        return;
    }
    let pieChart = echarts.init((type === "支出" ? payCateRef.value : incomeCateRef.value) as HTMLElement);
    let pieData: Array<{ name: string, value: number }> = [];
    let legendData: Array<string> = [];
    (type === "支出" ? categoryStatisticTime.value.payStatistic : categoryStatisticTime.value.incomeStatistic)
        .forEach((item: { category: string, amount: number, percent: string }, index: number) => {
            pieData.push({
                name: item.category,
                value: item.amount
            });
            if (index < 5) {
                legendData.push(item.category);
            }
        });
    const option = {
        tooltip: {
            trigger: "item"
        },
        title: {
            text: `前${legendData.length}项`,
            right: 40,
            top: 30,
            textStyle: {
                color: "rgb(129,135,138)",
                fontSize: 12
            }
        },
        legend: {
            type: "scroll",
            orient: "vertical",
            right: "0%",
            top: "18%",
            textStyle: {
                color: themeStore.darkMode ? "rgb(213, 213, 214)" : "rgb(31, 34, 37)"
            },
            data: legendData
        },
        series: [
            {
                name: `${type}类型分布`,
                type: "pie",
                radius: ["40%", "80%"],
                left: "-15%",
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: themeStore.darkMode ? "rgb(24,24,28)" : "rgb(255,255,255)",
                    borderWidth: 1
                },
                label: {
                    show: false,
                    position: "center"
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: "28",
                        fontWeight: "bold"
                    }
                },
                labelLine: {
                    show: false
                },
                data: pieData
            }
        ]
    };
    pieChart.setOption(option);
    charts.push(pieChart);
}

let charts: Array<any> = [];
window.onresize = function() {
    for (let i = 0; i < charts.length; i++) {
        charts[i].resize();
    }
};

watch(() => themeStore.darkMode, () => {
    initPieChart(pieSwitch.value);
});

function refreshPie(value: string): void {
    nextTick(() => {
        nextTick(() => {
            initPieChart(value === "支出" ? "支出" : "收入");
        });
    });
}

let dayPayAverage: ComputedRef<number> = computed(() => {
    let nowDate: Date = now();
    let count: number = nowDate.getMonth() == activeMonth.value ? nowDate.getDate() : days.value[activeMonth.value];
    return Math.round(payMonth.value / count * 100) / 100;
});
let dayIncomeAverage: ComputedRef<number> = computed(() => {
    let nowDate: Date = now();
    let count: number = nowDate.getMonth() == activeMonth.value ? nowDate.getDate() : days.value[activeMonth.value];
    return Math.round(incomeMonth.value / count * 100) / 100;
});

class dayItem {
    title: string;
    key: string;
    fixed: string | null;
    width: number | null;
    align: string;
    render: Function | null;
    sorter: string;

    constructor(title: string) {
        this.title = title;
        this.key = title;
        this.fixed = null;
        this.width = null;
        this.align = "left";
        switch (title) {
            case "日期":
                this.render = (row: any) => {
                    return h(
                        "p",
                        { class: "p-0" },
                        { default: () => row[this.key] }
                    );
                };
                break;
            case "支出":
                this.render = (row: any) => {
                    return h(
                        "p",
                        { class: "text-red-500 p-0" },
                        { default: () => row[this.key] >= 10000 ? Math.round(row[this.key] / 1000) / 10 + "万" : row[this.key] }
                    );
                };
                break;
            case "收入":
                this.render = (row: any) => {
                    return h(
                        "p",
                        { class: "text-green-500 p-0" },
                        { default: () => row[this.key] >= 10000 ? Math.round(row[this.key] / 1000) / 10 + "万" : row[this.key] }
                    );
                };
                break;
            default:
                this.render = null;
                break;
        }
        this.sorter = "default";
    }
}

const dayColumns: Array<Object> = [
    new dayItem("日期"),
    new dayItem("支出"),
    new dayItem("收入")
];
const dayData: ComputedRef = computed(() => {
    if (dayStatisticTime.value.payStatistic.length === 0 && dayStatisticTime.value.incomeStatistic.length === 0) {
        return [];
    }
    let data: Array<{ 日期: string, 支出: number, 收入: number }> = [];
    let nowDate: Date = now();
    let count: number = nowDate.getMonth() == activeMonth.value ? nowDate.getDate() : days.value[activeMonth.value];
    for (let i = 0; i < (count < dayStatisticTime.value.payStatistic.length ? count : dayStatisticTime.value.payStatistic.length); i++) {
        data.push({
            日期: dayStatisticTime.value.payStatistic[i].day.split(" ")[0],
            支出: dayStatisticTime.value.payStatistic[i].amount,
            收入: dayStatisticTime.value.incomeStatistic[i]?.amount
        });
    }
    return data;
});

class cateItem {
    title: string;
    key: string;
    fixed: string | null;
    width: number | null;
    align: string;
    render: Function | null;
    sorter: string | Function;

    constructor(title: string) {
        this.title = title;
        this.key = title;
        this.fixed = null;
        this.width = null;
        this.align = "left";
        switch (title) {
            case "类别":
                this.render = (row: any) => {
                    return h(
                        "p",
                        { class: "p-0 flex space-x-2" },
                        {
                            default: () => [
                                h(
                                    Icon,
                                    {
                                        icon: row.svg,
                                        class: "my-auto text-primary"
                                    }
                                ),
                                h(
                                    "p",
                                    { class: "my-auto" },
                                    { default: () => row[this.key] }
                                )
                            ]
                        }
                    );
                };
                this.sorter = "default";
                break;
            case "支出":
                this.render = (row: any) => {
                    return h(
                        "p",
                        { class: "text-red-500 p-0" },
                        { default: () => row.amount >= 10000 ? Math.round(row.amount / 1000) / 10 + "万" : row.amount }
                    );
                };
                this.sorter = (a: { amount: number; }, b: { amount: number; }) => {
                    return b.amount - a.amount;
                };
                break;
            case "收入":
                this.render = (row: any) => {
                    return h(
                        "p",
                        { class: "text-green-500 p-0" },
                        { default: () => row.amount >= 10000 ? Math.round(row.amount / 1000) / 10 + "万" : row.amount }
                    );
                };
                this.sorter = (a: { amount: number; }, b: { amount: number; }) => {
                    return b.amount - a.amount;
                };
                break;
            default:
                this.render = null;
                this.sorter = "default";
                break;
        }
    }
}

const cateColumns: ComputedRef<Array<Object>> = computed(() => {
    return [
        new cateItem("类别"),
        new cateItem(pieSwitch.value)
    ];
});
const cateData: ComputedRef = computed(() => {
    let data: Array<{ 类别: string, amount: number, svg: string }> = [];
    let rawData: Array<{ category: string, amount: number, percent: string }>
        = (pieSwitch.value === "支出" ? categoryStatisticTime.value.payStatistic : categoryStatisticTime.value.incomeStatistic);
    for (let i = 0; i < rawData.length; i++) {
        let svg: string | undefined = billCategory.value.find((item: BillCategory) => item.billCategoryName === rawData[i].category)?.svg;
        data.push({
            类别: rawData[i].category,
            amount: rawData[i].amount,
            svg: svg ? svg : ""
        });
    }
    return data;
});
</script>
<style scoped>
</style>