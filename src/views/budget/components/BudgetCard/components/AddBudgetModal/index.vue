<template>
    <n-modal
        :auto-focus="false"
        :show="showModal"
        class="w-992px"
        display-directive="show"
        preset="card"
        @close="closeModal"
    >
        <template #header>
            <span class="text-lg font-bold">添加预算</span>
        </template>

        <template #default>
            <n-grid :cols="10" :x-gap="16" :y-gap="8">
                <n-grid-item v-for="(category, index) in billCategoryList" :key="category.id"
                             :class="{ 'bg-primary-active': store.selectedBillCategoryId == category.id }"
                             class="rounded-lg p-2">
                    <n-button :disabled="disabledCategories.has(category.id)" text @click="selectCategory(category.id)">
                        <div class="flex flex-col items-center w-[64px]">
                            <Icon :icon="category.svg" class="text-primary" height="32" width="32"></Icon>
                            <span class="text-sm mt-2">{{ category.billCategoryName }}</span>
                        </div>
                    </n-button>
                </n-grid-item>
            </n-grid>

            <n-hr />

            <div class="flex-y-center justify-between px-2">
                <div class="flex-y-center">
                    <span class="text-base">预算总额</span>
                    <n-input-number v-model:value="limitInput"
                                    :show-button="false"
                                    class="ml-4"
                                    placeholder="请输入预算"
                    >
                        <template #prefix>￥</template>
                    </n-input-number>
                </div>
                <n-button class="w-30" size="medium" type="primary" @click="submitNewBudget">确定</n-button>

            </div>

        </template>
    </n-modal>

</template>

<script lang="ts" setup>

import { defineEmits, defineProps, onMounted, PropType, ref } from "vue";
import { addBudget, getAllBillCategoryApi, setBookBudget } from "@/apis";
import { BillCategory, Book, BookAllBillCategoryResponse } from "@/interface";
import { useStore } from "@/stores/store";
import { Icon } from "@iconify/vue";
import { useMessage } from "naive-ui";

const props = defineProps({
    showModal: {
        type: Boolean,
        required: true
    },
    book: {
        type: Object as PropType<Book>,
        required: true
    },
    disabledCategories: {
        type: Object as PropType<Set<Number>>,
        default: {} as Set<Number>
    }
});

const message = useMessage();
const emit = defineEmits(["update:showModal", "manualUpdateBook"]);

function closeModal() {
    emit("update:showModal", false);
}

const billCategoryList = ref<BillCategory[]>();

function getBillCategories() {
    getAllBillCategoryApi({ bookId: props.book.id, type: "支出" }).then((res: BookAllBillCategoryResponse) => {
        billCategoryList.value = res.billCategoryList;
    }).catch((err: Error) => {
        console.error(err);
    });
};

onMounted(() => {
    getBillCategories();
});

const store = useStore();

function selectCategory(id: number) {
    store.selectedBillCategoryId = id;
}

const limitInput = ref<number | null>(null);

function submitNewBudget() {
    if (store.selectedBillCategoryId === -1) {
        message.error("请选择类别！");
        return;
    }
    if (limitInput.value === null) {
        message.error("请输入预算总额！");
        return;
    }
    setBookBudget({ bookId: props.book.id, totalBudget: props.book.totalBudget + limitInput.value! }).then(() => {
        addBudget({
            bookId: props.book.id,
            billCategoryId: store.selectedBillCategoryId,
            limit: limitInput.value!
        }).then(() => {
            store.selectedBillCategoryId = -1;
            emit("manualUpdateBook", null);
            message.success("添加成功");
            closeModal();
            limitInput.value == null;
        }).catch((err: Error) => {
            console.error(err);
        });
    }).catch((err: Error) => {
        console.error(err);
    });
}

</script>

<style lang="scss" scoped>
</style>
