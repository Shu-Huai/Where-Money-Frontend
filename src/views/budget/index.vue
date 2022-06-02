<template>
    <div :style="{ minHeight: `calc(100vh - ${minHeight}px` }">
        <n-grid
            :item-responsive="true"
            :x-gap="16"
            :y-gap="16"
        >
            <n-grid-item
                v-for="(book, index) in bookList"
                :key="book.id"
                span="0:24 1000:12 1500:8"
            >
                <budget-card :book="book" @manual-update-book="getBooks"></budget-card>
            </n-grid-item>
        </n-grid>
    </div>
</template>

<script lang="ts" setup>

import { computed, onMounted, ref } from "vue";

import { getAllBookApi } from "@/apis";
import { Book, BookGetAllBookResponse } from "@/interface";
import { useThemeStore } from "@/store";

import { BudgetCard } from "./components";

const theme = useThemeStore();
const minHeight = computed(() => (theme.tab.height + theme.header.height + theme.footer.height + 32));

const bookList = ref<Book[]>();

function getBooks() {
    getAllBookApi().then((res: BookGetAllBookResponse) => {
        bookList.value = res.bookList;
    }).catch((err: Error) => {
        console.error(err);
    });
};

onMounted(() => {
    getBooks();
});

</script>

<style lang="scss" scoped>
</style>
