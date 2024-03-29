<template>
    <n-card :bordered="false" class="rounded-16px shadow-sm h-250px">
        <template #header>
            <n-space align="center">
                <Icon height="24px" icon="carbon:chart-line" width="24px"/>
                <span class="font-bold text-xl">资产历史</span>
            </n-space>
        </template>

        <template #default>
            <div ref="lineChartAreaRef" class="h-[100%] flex content-center items-center justify-center">
                <n-spin v-if="statisticList.length === 0" size="large"/>
            </div>
        </template>
    </n-card>
</template>

<script lang="ts" setup>
// vue
import {defineProps, PropType, ref, watch} from "vue";
// components
import {Icon} from "@iconify/vue";
import {Line} from "@antv/g2plot";
// .ts
import {AssetDayStatistic} from "@/interface";
import {formattedCurrencyNoSymbol, getThemeColor} from "@/utils";
import {useThemeStore} from "@/store";


const props = defineProps({
    statisticList: {
        type: Array as PropType<Array<AssetDayStatistic>>,
        required: true,
        default: [] as Array<AssetDayStatistic>
    }
});

const lineChart = ref<Line>();
const lineChartAreaRef = ref<HTMLElement>();
const key = "__THEME_COLOR__";
const theme = useThemeStore();
let color: string | null = getThemeColor();
watch(
    () => theme.themeColor,
    newValue => {
        color = newValue;
        lineChart.value?.destroy();
        initAndPlotLineChart();
    },
    {immediate: true}
);

function initAndPlotLineChart() {
    if (lineChartAreaRef.value === undefined) return;
    lineChart.value = new Line(lineChartAreaRef.value as any, {
        color: color ? color : "#2092C6",
        data: props.statisticList,
        xField: "time",
        yField: "total",
        xAxis: {
            type: "timeCat",
            label: {
                rotate: -Math.PI / 8,
                offset: 20,
                style: {fontSize: 14}
            }
        },
        yAxis: {
            grid: null,
            min: null,
            max: null,
            tickCount: 4,
            label: {
                style: {fontSize: 14},
                formatter: (text: string) => (new Intl.NumberFormat("zh-CN", {
                    style: "decimal",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }).format(parseFloat(text)))
            },
            line: {
                "style": {
                    "lineWidth": 1,
                    "stroke": "#BFBFBF"
                }
            },
            tickLine: {
                "style": {
                    "lineWidth": 1,
                    "stroke": "#BFBFBF"
                },
                "alignTick": true,
                "length": 4
            },
            subTickLine: null,
            animate: true
        },
        lineStyle: {
            strokeOpacity: 1,
            lineWidth: 3
        },
        animation: {
            appear: {
                animation: "wave-in",
                duration: 1500
            }
        },
        tooltip: {
            showCrosshairs: true,
            crosshairs: {type: "xy"},
            formatter: (datum) => ({name: "净资产", value: formattedCurrencyNoSymbol(datum.total)}),
            domStyles: {
                "g2-tooltip": {fontSize: "16px"}
            }
        }
    } as any);
    lineChart.value?.render();
}

watch(() => props.statisticList,
    (newVal) => {
        if (!!lineChart.value) {
            lineChart.value?.changeData(newVal as any);
        } else {
            initAndPlotLineChart();
        }
    },
    {deep: true}
);
</script>

<style lang="scss" scoped>
</style>
