<template>
    <n-modal :mask-closable="false" v-model:show="showAdd" :on-after-leave="closed" class="w-1/2">
        <n-card id="drawer-target" class="w-full">
            <template #header>
                <div>新增账本</div>
            </template>
            <template #header-extra>
                <Icon icon="icon-park-outline:close" class="cursor-pointer h-4 w-4"
                      v-bind:class="{'text-primary':mouseOnClose}" v-on:mouseenter="mouseOnClose=true"
                      v-on:mouseleave="mouseOnClose=false"
                      v-on:click="showAdd=false" />
            </template>
            <template #default>
                <n-form ref="formRef" :model="model" :rules="rules">
                    <n-form-item path="title" label="账本名称：">
                        <n-input v-model:value="model.title" @keydown.enter.prevent />
                    </n-form-item>
                    <n-form-item path="beginDate" label="开始日期：">
                        <n-date-picker
                            style="width: 100%"
                            v-model:formatted-value="model.beginDate"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            type="datetime"
                            clearable
                        />
                    </n-form-item>
                    <n-button class="w-full addButton" type="primary" v-on:click="addBook">
                        <template #default>
                            保存
                        </template>
                    </n-button>
                </n-form>
            </template>
        </n-card>
    </n-modal>
</template>
<script lang="ts" setup>
import { reactive, Ref, ref } from "vue";
import { useMessage } from "naive-ui";
import { addBookApi } from "@/apis/book";
import { Icon } from "@iconify/vue";

const message = useMessage();
// 弹框显示
const showAdd = ref(false);
const mouseOnClose: Ref<boolean> = ref(false);

interface addData {
    title: string;
    beginDate: null | string;
}

const model = reactive<addData>({
    title: "",
    beginDate: null
});
const initModal = () => {
    showAdd.value = true;
};
const rules = {
    title: {
        required: true,
        message: "请输入名称",
        trigger: "blur"
    },
    beginDate: {
        required: true,
        message: "请选择账单起始日",
        trigger: "blur"
    }
};

// 新增账本
const formRef = ref();
const addBook = () => {
    formRef.value?.validate((errors: any) => {
        if (!errors) {
            addBookApi({ title: model.title, beginDate: 1 }).then((res: any) => {
                console.log(res, 111);
                message.success("新增成功");
                showAdd.value = false;
            });
        }
    });
};
const closed = () => {
    model.beginDate = null;
    model.title = "";
};
const init = () => {
    showAdd.value = true;
};
defineExpose({ init });
</script>
