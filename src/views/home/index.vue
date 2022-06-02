<template>
    <div class="wrapper">
        <n-card size="small" class="top-card">
            <div style="line-height:34px">
                <label>账本：</label>
                <n-select v-model:value="bookId" :options="bookList" @update:value="changeBook"
                          @update:show="getBooks"></n-select>
                <n-button type="primary" @click="addBook" style="margin:0 16px;">新增账本</n-button>
                <!-- <label>时间：</label> -->
            </div>
        </n-card>
        <div class="home-wrap">
            <div class="left-wrap">
                <n-grid :x-gap="16" :cols="3" class="info-wrap">
                    <n-grid-item>
                        <div class="info-item">
                            <img class="item-left" src="./assets/zhichu.png"  alt="支出"/>
                            <div class="item-right">
                                <div>月支出</div>
                                <div>{{ payNum }}</div>
                            </div>
                        </div>
                    </n-grid-item>
                    <n-grid-item>
                        <div class="info-item second-item">
                            <img class="item-left" src="./assets/shoru.png"  alt="收入"/>
                            <div class="item-right">
                                <div>月收入</div>
                                <div>{{ incomeNum }}</div>
                            </div>
                        </div>
                    </n-grid-item>
                    <n-grid-item>
                        <div class="info-item third-item">
                            <img class="item-left" src="./assets/jieyu.png"  alt="结余"/>
                            <div class="item-right">
                                <div>月结余</div>
                                <div>{{ balanceNum }}</div>
                            </div>
                        </div>
                    </n-grid-item>
                </n-grid>
                <n-card size="small" class="top-card" style="margin-top:16px; border-radius:8px">
                    <h2 style="font-weight:700">支出分布</h2>
                    <div ref="lineChartRef" style="height:300px">

                    </div>
                </n-card>
                <n-card size="small" class="top-card" style="margin-top:16px;border-radius:8px">
                    <n-radio-group v-model:value="activeType" @update:value="initPieChart" size="medium">
                        <n-radio-button
                            v-for="item in ['收入','支出']"
                            :key="item"
                            :value="item"
                        >
                            {{ item }}
                        </n-radio-button>
                    </n-radio-group>
                    <div ref="pieChartRef" style="height:360px">

                    </div>
                </n-card>
            </div>
            <div class="right-wrap">
                <n-card>
                    <n-calendar
                        v-model:value="calendarValue"
                        #="{ year, month, date }"
                        @update:value="handleUpdateValue"
                        @panel-change="panelChange"
                    >
                        <div style="line-height:14px;font-size:12px;text-align:center">

                            <div style="color:red">
                                +{{ Math.round(allBillList.find(item => item.time === (year + "-" + (month >= 10 ? month : "0" + month) + "-" + (date >= 10 ? date : "0" + date)))?.incomeNum * 100) / 100 || 0
                                }}
                            </div>
                            <div style="color:#49cc90">
                                -{{ Math.round(allBillList.find(item => item.time === (year + "-" + (month >= 10 ? month : "0" + month) + "-" + (date >= 10 ? date : "0" + date)))?.payNum * 100) / 100 || 0
                                }}
                            </div>
                        </div>
                    </n-calendar>
                </n-card>
                <div style="overflow-y:auto;height:456px;margin-top:16px">
                    <n-card style="margin-bottom:10px" :key="index"
                            v-for="(item,index) in allBillList.filter(child=>parseInt(child.time.split('-')[0])===activeYear&&parseInt(child.time.split('-')[1])===activeMonth)">
                        <template #header>
                            <div>
                                <div class="fl">
                                    {{ item.time }}
                                </div>
                                <div class="fr">
                                    支{{ item.payNum.toFixed(2) }} 收{{ item.incomeNum.toFixed(2) }}
                                </div>
                            </div>
                        </template>
                        <template #default>
                            <div class="bill-item" v-for="child in item.billList" :key="child.id">
                                <div style="font-size:14px;font-weight:600;overflow:hidden">
                                    <span class="bill-item-type fl">{{ child.type }}</span>
                                    <span class="fr">{{ child.amount }}</span>
                                </div>
                                <div style="font-size:12px;overflow:hidden">
                                    <span class="fl">{{ child.remark }}</span>
                                    <span class="fr">{{ child.billCategory }}</span>
                                </div>
                            </div>
                        </template>
                    </n-card>
                </div>
            </div>
        </div>
        <!-- 新增账本 -->
        <BookForm ref="bookFormRef" />
        <!-- 新增账单 -->
        <!-- <BillForm ref="billFormRef"/> -->
    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { addDays } from "date-fns/esm";
// api
import { getAllBookApi, getBalanceMonthApi, getIncomeMonthApi, getPayMonthApi } from "@/apis/book";
import { getAllBillInBookApi, getBillInStatisticTimeApi } from "@/apis/bill";
// 组件
import { BookForm } from "./components";

import * as echarts from "echarts";
import { storage } from "@/utils";

// 当前选中bookId
const bookId = ref<any>(null);
// 账本数据
const bookList = ref<any[]>([]);
// 获取账本
const getBooks = () => {
    getAllBookApi().then((res: any) => {
        bookList.value = res.bookList.reduce((pre: any[], item: any) => {
            pre.push({ label: item.title, value: item.id });
            return pre;
        }, []);
        if (!bookId.value) {
            bookId.value = res.bookList[0].id;
            storage.set("bookId", bookId.value);
            getBalanceMonth();
            getIncomeMonth();
            getPayMonth();
            getAllBillInBook();
            getBillInStatisticTime();
        }
    });
};
getBooks();
// 切换账本
const changeBook = () => {
    storage.set("bookId", bookId.value);
    getBalanceMonth();
    getIncomeMonth();
    getPayMonth();
    getAllBillInBook();
    getBillInStatisticTime();
};
// 新增账本
const bookFormRef = ref();
const addBook = () => {
    bookFormRef.value.init();
};

// 获取账单结余
const balanceNum = ref(0);
const getBalanceMonth = () => {
    const startTime = new Date(activeYear.value, activeMonth.value - 1, 1).toLocaleString().replaceAll("/", "-");
    const endTime = new Date(activeYear.value, activeMonth.value, 1).toLocaleString().replaceAll("/", "-");
    getBalanceMonthApi({ bookId: bookId.value, startTime: startTime, endTime: endTime }).then((res: any) => {
        balanceNum.value = res.amount ?? 0;
    });
};
// 获取账单月收入
const incomeNum = ref(0);
const getIncomeMonth = () => {
    const startTime = new Date(activeYear.value, activeMonth.value - 1, 1).toLocaleString().replaceAll("/", "-");
    const endTime = new Date(activeYear.value, activeMonth.value, 1).toLocaleString().replaceAll("/", "-");
    getIncomeMonthApi({ bookId: bookId.value, startTime: startTime, endTime: endTime }).then((res: any) => {
        incomeNum.value = res.amount ?? 0;
    });
};
// 获取账单月支出
const payNum = ref(0);
const getPayMonth = () => {
    const startTime = new Date(activeYear.value, activeMonth.value - 1, 1).toLocaleString().replaceAll("/", "-");
    const endTime = new Date(activeYear.value, activeMonth.value, 1).toLocaleString().replaceAll("/", "-");
    getPayMonthApi({ bookId: bookId.value, startTime: startTime, endTime: endTime }).then((res: any) => {
        payNum.value = res.amount ?? 0;
    });
};

// 获取指定账本所有账单
const allBillList = ref<any[]>([]);
const bookBillList = ref<any[]>([]);
const getAllBillInBook = () => {
    getAllBillInBookApi({ bookId: bookId.value }).then((res: any) => {
        bookBillList.value = res.billList;
        allBillList.value = res.billList.reduce((pre: any[], item: any, index: number) => {
            const billTime = item.billTime.split(" ")[0];
            if (index === 0) {
                pre.push({ time: billTime, billList: [item], incomeNum: 0, payNum: 0 });
                if (["收入", "退款"].includes(item.type)) {
                    pre[0].incomeNum = item.amount;
                } else if (item.type === "支出") {
                    pre[0].payNum = item.amount;
                }
                return pre;
            }

            const preTime = pre[pre.length - 1].time;
            if (billTime === preTime) {
                pre[pre.length - 1].billList.push(item);
                if (["收入", "退款"].includes(item.type)) {
                    pre[pre.length - 1].incomeNum += item.amount;
                } else if (item.type === "支出") {
                    pre[pre.length - 1].payNum += item.amount;
                }
            } else {
                pre.push({ time: billTime, billList: [item], incomeNum: 0, payNum: 0 });
                if (["收入", "退款"].includes(item.type)) {
                    pre[pre.length - 1].incomeNum = item.amount;
                } else if (item.type === "支出") {
                    pre[pre.length - 1].payNum = item.amount;
                }
            }
            return pre;
        }, [] as any[]);
        initLineChart();
        // getBillCategory()
    });
};

// 获取账本所有账单类型
// const allCategoryList=ref<any[]>([])
// const getBillCategory=()=>{
//   getBillCategoryApi({bookId:bookId.value}).then((res:any)=>{
//     allCategoryList.value=res
//     initPieChart()
//   })
// }

// 切换日历面板
const activeYear = ref<number>(new Date().getFullYear());
const activeMonth = ref<number>(new Date().getMonth() + 1);
const panelChange = (info: { year: number, month: number }) => {
    activeYear.value = info.year;
    activeMonth.value = info.month;
    initLineChart();
    getBillInStatisticTime();
    getIncomeMonth();
    getPayMonth();
    getBalanceMonth();
};

// 获取支出分布柱状图
const lineChartRef = ref<HTMLElement>();
const initLineChart = () => {
    const lineChart = echarts.init(lineChartRef.value as HTMLElement);
    const xData = [];
    for (let i = 1; i <= ([1, 3, 5, 7, 8, 10, 12].includes(activeMonth.value) ? 31 : activeMonth.value === 2 ? 28 : 30); i++) {
        xData.push(i);
    }
    const tempData = allBillList.value.filter(item => {
        return parseInt(item.time.split("-")[1]) === activeMonth.value;
    });
    const lineData: number[] = [];
    let maxNum = 0;
    let minNum = 0;
    xData.forEach(item => {
        const temp = tempData.find(child => {
            return parseInt(child.time.split("-")[2]) === item;
        });
        if (temp) {
            maxNum < temp.payNum && (maxNum = temp.payNum.toFixed(2));
            minNum > temp.payNum && (minNum = temp.payNum.toFixed(2));
        }
        temp ? lineData.push(Math.round(temp.payNum * 100) / 100) : lineData.push(0);
    });
    const option = {
        xAxis: {
            type: "category",
            data: xData
        },
        yAxis: {
            type: "value",
            name: `最大一笔：${maxNum} 最小一笔：${minNum}`,
            nameGap: 20,
            nameTextStyle: {
                padding: [0, 0, 0, 100]		//表示[上,右,下,左]的边距
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
                color: "red",
                itemStyle: {
                    normal: {
                        //这里设置柱形图圆角 [左上角，右上角，右下角，左下角]
                        barBorderRadius: [6, 6, 0, 0]
                    }
                }
            }
        ]
    };
    lineChart.setOption(option);
};

//分类获取指定日期账单
const activeType = ref("收入");
const statisticBills = ref<any>();
const getBillInStatisticTime = () => {
    const startTime = new Date(activeYear.value, activeMonth.value - 1, 1).toLocaleString().replaceAll("/", "-");
    const endTime = new Date(activeYear.value, activeMonth.value, 1).toLocaleString().replaceAll("/", "-");
    getBillInStatisticTimeApi({ bookId: bookId.value, startTime, endTime }).then((res: any) => {
        statisticBills.value = res;
        initPieChart();
    });
};
// 获取支出统计饼状图
const pieChartRef = ref<HTMLElement>();
const initPieChart = () => {
    const pieChart = echarts.init(pieChartRef.value as HTMLElement);
    // const pieData=allCategoryList.value.reduce((pre,item)=>{
    //   pre.push({value:0,name:item.billCategoryName})
    //   return pre
    // },[] as any[])
    // const tempData=bookBillList.value.filter(item=>{
    //   const year=parseInt(item.billTime.split(' ')[0].split('-')[0])
    //   const month=parseInt(item.billTime.split(' ')[0].split('-')[1])
    //   return year===activeYear.value&&month===activeMonth.value
    // })
    // tempData.forEach(item=>{
    //   const temp=pieData.find((child:any)=>item.billCategory===child.name)
    //   temp&&(temp.value+=item.amount)
    // })
    // pieData.sort((a:any,b:any)=>b.value-a.value)

    // const legend:any[]=[]
    // pieData.forEach((item:any,index:number)=>{
    //   if(index<=4){
    //     legend.push(item.name)
    //   }
    // })
    let tempData: any[];
    if (activeType.value === "收入") {
        tempData = statisticBills.value.incomeStatistic;
    } else {
        tempData = statisticBills.value.payStatistic;
    }
    const pieData: any[] = [];
    const legendData: string[] = [];
    tempData.forEach((item: any, index: number) => {
        if (index <= 4) {
            legendData.push(item.category);
        }
        pieData.push({ name: item.category, value: item.amount });
    });
    const option = {
        tooltip: {
            trigger: "item"
        },
        title: {
            text: "前五项",
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
            right: 20,
            top: 50,
            bottom: 20,
            data: legendData
        },
        series: [
            {
                name: `${activeType.value}类型分布`,
                type: "pie",
                left: -50,
                radius: ["60%", "70%"],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: "center"
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: "40",
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
};
// 日历相关
const calendarValue = ref(addDays(Date.now(), 0).valueOf());
const handleUpdateValue = (_: number, { year, month, date }: { year: number; month: number; date: number }) => {

};

</script>
<style lang="scss" scoped>
.wrapper {
    .top-card {
        /* line-height: 32px; */
        .n-select {
            display: inline-block;
            width: 200px;
        }
    }

    .home-wrap {
        padding: 16px 0;
        display: flex;

        .right-wrap {
            width: 35%;
            padding-left: 16px;

            .n-calendar {
                height: auto;
            }
        }

        .left-wrap {
            width: 65%;

            .info-wrap {
                .info-item {
                    height: 100px;
                    background: rgb(244, 229, 230);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-around;

                    &.second-item {
                        background: rgb(224, 239, 232);
                    }

                    &.third-item {
                        background: rgb(226, 235, 245);
                    }
                }
            }
        }
    }

    .fr {
        float: right;
    }

    .fl {
        float: left;
    }
}
</style>
