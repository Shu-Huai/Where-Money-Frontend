<template>
    <n-modal
        :auto-focus="false"
        :show="showModal"
        class="w-500px"
        display-directive="show"
        preset="card"
        @close="closeModal"
    >
        <template #header>
            <span class="text-lg font-bold">新增资产</span>
        </template>

        <template #default>
            <n-form v-if="assetInfo" :model="assetInfo">
                <n-space :size="16" vertical>
                    <form-item-container label="资产类型">
                        <n-radio-group
                            v-model:value="assetInfo.type"
                            name="assetTypeGroup"
                            size="medium"
                        >
                            <n-radio-button
                                v-for="(typeName) in ['信用卡', '充值', '投资理财', '资金']"
                                :key="typeName"
                                :label="typeName"
                                :value="typeName"
                                size="medium"
                            >
                                <span>{{ typeName }}</span>
                            </n-radio-button>
                        </n-radio-group>
                    </form-item-container>

                    <form-item-container label="资产图标">
                        <n-input
                            v-model:value.trim="assetInfo.svg"
                            class="w-240px"
                            size="medium"
                        />
                        <Icon
                            :icon="assetInfo.svg"
                            class="text-info mx-2"
                            height="24"
                        />
                    </form-item-container>

                    <form-item-container label="资产名称">
                        <n-input
                            v-model:value="assetInfo.assetName"
                            class="w-240px"
                            size="medium"
                        />
                    </form-item-container>

                    <form-item-container :label="assetInfo.type === '信用卡' ? '当前欠款（负数）' : '资产余额'">
                        <n-input-number
                            v-model:value="assetInfo.balance"
                            :show-button="false"
                            :validator="validateAssetBalance"
                            class="w-240px"
                            size="medium"
                        >
                            <template #prefix>
                                <span>￥</span>
                            </template>
                        </n-input-number>
                    </form-item-container>

                    <form-item-container label="计入资产总额">
                        <n-switch
                            v-model:value="assetInfo.inTotal"
                            size="medium"
                        />
                    </form-item-container>

                    <template v-if="assetInfo.type === '信用卡'">
                        <n-divider>账单设置</n-divider>
                        <form-item-container label="总额度">
                            <n-input-number
                                v-model:value="assetInfo.quota"
                                :min="0"
                                :show-button="false"
                                class="w-240px"
                                size="medium"
                            >
                                <template #prefix>
                                    <span>￥</span>
                                </template>
                            </n-input-number>
                        </form-item-container>

                        <form-item-container label="出账日">
                            <n-input-number
                                v-model:value="assetInfo.billDate"
                                :max="31"
                                :min="1"
                                class="w-240px text-center"
                                size="medium"
                            >
                                <template #prefix>每月</template>
                                <template #suffix>日</template>
                            </n-input-number>
                        </form-item-container>

                        <form-item-container label="还款日">
                            <n-input-number
                                v-model:value="assetInfo.repayDate"
                                :max="31"
                                :min="1"
                                class="w-240px text-center"
                                size="medium"
                            >
                                <template #prefix>每月</template>
                                <template #suffix>日</template>
                            </n-input-number>
                        </form-item-container>

                    </template>
                    <n-button
                        class="w-full"
                        type="primary"
                        @click="submitHandler"
                    >
                        <span>确定</span>
                    </n-button>
                </n-space>
            </n-form>
        </template>
    </n-modal>
</template>


<script lang="ts" setup>

import { defineEmits, defineProps, ref } from "vue";

import { FormItemContainer } from "../";

import { useMessage } from "naive-ui";
import { Icon } from "@iconify/vue";


const props = defineProps({
    showModal: {
        type: Boolean,
        required: true,
        default: false
    }
});

const assetInfo = ref<any>({ inTotal: true });

/**
 * @description 资产金额验证
 */
function validateAssetBalance(value: number) {
    if (assetInfo.value === undefined) return false;
    if (assetInfo.value.type === "信用卡" && value > 0) {
        return false;
    }
    return !(assetInfo.value.type !== "信用卡" && value < 0);
    
}

const emit = defineEmits(["update:showModal", "newAssetSubmitted"]);

function closeModal() {
    emit("update:showModal", false);
}

const message = useMessage();

/**
 * @description 提交新资产
 */
function submitHandler() {
    // 验证全部填写了
    let allBlankFilled = true;
    let keys = ["assetName", "balance", "type", "svg"];
    for (const keyIdx in keys) {
        if (!assetInfo.value[keys[keyIdx]]) {
            message.error("请填写完整信息！");
            allBlankFilled = false;
            break;
        }
    }
    if (assetInfo.value.type === "信用卡") {
        keys = ["billDate", "repayDate", "quota"];
        for (const keyIdx in keys) {
            if (!assetInfo.value[keys[keyIdx]]) {
                message.error("请填写完整信息！");
                allBlankFilled = false;
                break;
            }
        }
    }
    if (!allBlankFilled) return;
    // 验证balance，其他的有输入框限制
    if (assetInfo.value.type === "信用卡" && assetInfo.value.balance! > 0) {
        message.error("欠款金额请输入负数！");
    } else if (assetInfo.value.type !== "信用卡" && assetInfo.value.balance! < 0) {
        message.error("资产余额不能为负数！");
    } else {
        emit("newAssetSubmitted", assetInfo.value);
        for (const key in assetInfo.value) {
            assetInfo.value[key] = null;
        }
        assetInfo.value.inTotal = true;
        message.success("添加成功！");
    }
}

</script>

<style lang="scss" scoped>
:deep(.option-container) {
    width: 240px;
}
</style>
