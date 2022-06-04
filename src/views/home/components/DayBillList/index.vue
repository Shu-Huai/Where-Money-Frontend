<template>
    <div>
        <n-card class="rounded-xl">
            <template #header>
                {{ day }}
            </template>
            <template #default>
                <BillItem v-for="item in billList" v-bind:type="item.type" v-bind:bill="item"></BillItem>
            </template>
        </n-card>
    </div>
</template>
<script lang="ts" setup>
import BillItem from "./components";

defineProps({
    day: {
        type: String,
        required: true
    },
    billList: {
        type: Array,
        default: []
    }
});
</script>
<style scoped>
</style>