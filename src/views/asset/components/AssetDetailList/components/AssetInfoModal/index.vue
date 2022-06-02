<template>
    <n-modal
        :auto-focus="false"
        :show="showModal"
        class="w-500px"
        display-directive="show"
        preset="card"
        @close="closeModal"
        @after-enter="getAssetInfoById"
    >
        <template #header>
            <n-space align="flex-end" justify="start">
                <span class="text-lg font-bold">资产信息</span>
                <n-button size="small" text @click="canInput = true">
                    <div v-show="!canInput" class="flex-y-center">
                        <span class="text-sm">修改</span>
                        <Icon height="1rem" icon="fluent:edit-48-regular" width="1rem"></Icon>
                    </div>
                </n-button>
            </n-space>
        </template>

        <template #default>
            <n-form v-if="assetInfo !== undefined" :model="assetInfo">
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
                                :disabled="true"
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
                            v-model:value="assetInfo.svg"
                            :disabled="!canInput"
                            class="w-240px"
                            size="medium"
                        />
                        <Icon
                            :icon="assetInfo.svg"
                            class="text-primary mx-2"
                            height="24"
                        />
                    </form-item-container>

                    <form-item-container label="资产名称">
                        <n-input
                            v-model:value="assetInfo.assetName"
                            :disabled="!canInput"
                            class="w-240px"
                            size="medium"
                        />
                    </form-item-container>

                    <form-item-container :label="assetInfo.type === '信用卡' ? '当前欠款（负数）' : '资产余额'">
                        <n-input-number
                            v-model:value="assetInfo.balance"
                            :disabled="!canInput"
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
                            :disabled="!canInput"
                            size="medium"
                        />
                    </form-item-container>

                    <template v-if="assetInfo.type === '信用卡'">
                        <n-divider>账单设置</n-divider>
                        <form-item-container label="总额度">
                            <n-input-number
                                v-model:value="assetInfo.quota"
                                :disabled="!canInput"
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
                                :disabled="!canInput"
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
                                :disabled="!canInput"
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
                        :disabled="!canInput"
                        class="w-full"
                        type="primary"
                        @click="applyChanges"
                    >
                        <span>确定</span>
                    </n-button>
                </n-space>
            </n-form>
        </template>
    </n-modal>
</template>


<script lang="ts" setup>

import { defineEmits, defineProps, ref, watch } from "vue";

import { Asset, AssetGetAssetResponse } from "@/interface";
import { getAssetApi } from "@/apis";
import { FormItemContainer } from "../";

import { useMessage } from "naive-ui";
import { Icon } from "@iconify/vue";


const props = defineProps({
    showModal: {
        type: Boolean,
        required: true,
        default: false
    },
    assetId: {
        type: Number,
        required: true,
        default: 0
    }
});

/**
 * @description 按ID获取资产信息
 */
const assetInfo = ref<Asset>();

function getAssetInfoById() {
    const params = { id: props.assetId };
    getAssetApi(params).then((res: AssetGetAssetResponse) => {
        assetInfo.value = res.asset;
    }).catch((err: Error) => {
        console.log(err);
    });
}

/**
 * @description 是否禁用输入框
 */
const canInput = ref(false);

watch(() => props.assetId,
    () => {
        getAssetInfoById();
    }
);

/**
 * @description 资产金额验证
 */
function validateAssetBalance(value: number) {
    if (assetInfo.value === undefined) return false;
    if (assetInfo.value.type === "信用卡" && value > 0) {
        return false;
    }
    if (assetInfo.value.type !== "信用卡" && value < 0) {
        return false;
    }
    return true;
}

const emit = defineEmits(["update:showModal", "changeSubmitted"]);

async function closeModal() {
    emit("update:showModal", false);
    canInput.value = false;
}

const message = useMessage();

/**
 * @description 应用修改
 */
function applyChanges() {
    if (assetInfo.value!.type === "信用卡" && assetInfo.value!.balance > 0) {
        message.error("欠款金额请输入负数！");
    } else if (assetInfo.value!.type !== "信用卡" && assetInfo.value!.balance < 0) {
        message.error("资产余额不能为负数！");
    } else {
        canInput.value = false;
        emit("changeSubmitted", assetInfo.value!);
        message.success("修改成功！");
    }
}

</script>

<style lang="scss" scoped>
:deep(.option-container) {
    width: 240px;
}
</style>
