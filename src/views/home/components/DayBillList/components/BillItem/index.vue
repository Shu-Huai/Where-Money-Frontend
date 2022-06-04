<template>
    <div>
        <div v-if="type==='支出'" class="flex justify-between h-18">
            <div class="flex space-x-2">
                <Icon icon="material-symbols:arrow-upward" class="text-red-500 h-5 w-5 my-auto" />
                <div class="my-auto">
                    <div class="text-base">{{ bill.billCategory + (bill.refunded ? "（已退款）" : "") }}</div>
                    <div class="text-sm">{{ bill.remark }}</div>
                </div>
            </div>
            <div>
                <div class="text-red-500 text-base flex justify-end">-{{ bill.amount }}</div>
                <div class="text-sm flex justify-end">{{ bill.payAsset }}</div>
                <div class="text-sm flex justify-end">{{ bill.billTime }}</div>
            </div>
        </div>
        <div v-else-if="type==='收入'" class="flex justify-between h-18">
            <div class="flex space-x-2">
                <Icon icon="material-symbols:arrow-downward" class="text-green-500 h-5 w-5 my-auto" />
                <div class="my-auto">
                    <div class="text-base">{{ bill.billCategory }}</div>
                    <div class="text-sm">{{ bill.remark }}</div>
                </div>
            </div>
            <div>
                <div class="text-green-500 text-base flex justify-end">+{{ bill.amount }}</div>
                <div class="text-sm flex justify-end">{{ bill.incomeAsset }}</div>
                <div class="text-sm flex justify-end">{{ bill.billTime }}</div>
            </div>
        </div>
        <div v-else-if="type==='转账'" class="flex justify-between h-18">
            <div class="flex space-x-2">
                <Icon icon="ph:arrows-clockwise" class="text-blue-500 h-5 w-5 my-auto" />
                <div class="my-auto">
                    <div class="text-base">{{ "转账" }}</div>
                    <div class="text-sm">{{ bill.remark }}</div>
                </div>
            </div>
            <div>
                <div class="text-blue-500 text-base flex justify-end">{{ bill.amount }}</div>
                <div class="text-sm flex justify-end">{{ bill.outAsset + "→" + bill.inAsset }}</div>
                <div class="text-sm flex justify-end">{{ bill.billTime }}</div>
            </div>
        </div>
        <div v-else-if="type==='退款'" class="flex justify-between h-18">
            <div class="flex space-x-2">
                <Icon icon="ph:arrows-down-up" class="text-blue-500 h-5 w-5 my-auto" />
                <div class="my-auto">
                    <div class="text-base">{{ "退款" }}</div>
                    <div class="text-sm">{{ bill.remark }}</div>
                </div>
            </div>
            <div>
                <div class="text-blue-500 text-base flex justify-end">{{ bill.amount }}</div>
                <div class="text-sm flex justify-end">{{ bill.refundAsset }}</div>
                <div class="text-sm flex justify-end">{{ bill.billTime }}</div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { Icon } from "@iconify/vue";

defineProps({
    type: {
        type: String,
        default: ""
    },
    bill: {
        type: Object,
        default: {}
    }
});
</script>
<style scoped>
</style>