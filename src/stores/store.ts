import { defineStore } from "pinia";

export const useStore = defineStore("main", {
    state: () => {
        return {
            selectedBillCategoryId: 0,
            bookId: Number(),
        };
    },
    getters: {},
    actions: {}
});