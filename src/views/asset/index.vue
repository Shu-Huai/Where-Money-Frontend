<template>
    <n-space
        :size="16"
        :style="{ minHeight: `calc(100vh - ${minHeight}px)` }"
        :vertical="true"
    >
        <n-grid
            :item-responsive="true"
            :x-gap="16"
            :y-gap="16"
        >
            <n-grid-item span="0:24 640:24 1024:9">
                <asset-summarization
                    v-model:debt="debt"
                    v-model:net="net"
                    v-model:total="total"
                    class="h-250px"
                />
            </n-grid-item>
            <n-grid-item span="0:24 640:24 1024:15">
                <asset-history-chart
                    :statistic-list="dayStatisticList"
                    class="h-250px"
                />
            </n-grid-item>
        </n-grid>

        <asset-detail-list
            v-model:asset-list="assetList"
            @asset-list-changed="pullAllAsset"
        />
    </n-space>
</template>

<script lang="ts" setup>

import { computed, onMounted, ref, Ref, watch } from "vue";
import { getAllAsset, getDayStatisticTime } from "@/apis";
import { Asset, AssetDayStatistic, AssetDayStatisticTimeResponse, AssetGetAllAssetResponse } from "@/interface";
import { AssetDetailList, AssetHistoryChart, AssetSummarization } from "./components";
import { useThemeStore } from "@/store";

const theme = useThemeStore();
const minHeight = computed(() => (theme.tab.height + theme.header.height + theme.footer.height + 32));

// 第一张卡片：资产总览
const total = ref(0);
const debt = ref(0);
const net = ref(0);
const assetList = ref([] as Asset[]);

/**
 * @description 获取所有资产
 */
function pullAllAsset() {
    getAllAsset().then((data: AssetGetAllAssetResponse) => {
        assetList.value = data.assetList;
        total.value = data.totalAsset;
        debt.value = data.totalLiabilities;
        net.value = data.netAsset;
    }).catch((error: any) => {
        console.log(error);
    });
}

watch(assetList, (newValue: Asset[]) => {
    total.value = newValue.reduce((acc: number, cur: Asset) => {
        if (!cur.inTotal) return acc;
        return cur.balance < 0 ? acc : acc + cur.balance;
    }, 0);
    debt.value = newValue.reduce((acc: number, cur: Asset) => {
        if (!cur.inTotal) return acc;
        return cur.balance > 0 ? acc : acc + cur.balance;
    }, 0);
    net.value = total.value + debt.value;
}, { deep: true });

// 第二张卡片：资产变化曲线
const dayStatisticList: Ref<AssetDayStatistic[]> = ref([]);

/**
 * @description 获取资产变化
 */
function pullAssetDayStatistic() {
    const today = new Date();
    today.setHours(24, 0, 0, 0);
    const past30Day = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    getDayStatisticTime({
        startTime: past30Day.toLocaleString().replaceAll("/", "-"),
        endTime: today.toLocaleString().replaceAll("/", "-")
    }).then((res: AssetDayStatisticTimeResponse) => {
        dayStatisticList.value = res.dayStatistic;
    }).catch((error: any) => {
        console.log(error);
    });
}

onMounted(() => {
    pullAllAsset();
    pullAssetDayStatistic();
});

</script>

<style lang="scss" scoped>
</style>
