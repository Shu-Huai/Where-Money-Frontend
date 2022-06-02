import http from "@/utils/http";

export function addBudget(params: { bookId: number, billCategoryId: number, limit: number }): any {
    return http.post("budget/add-budget", params);
}

export function getBudgetsByBook(params: { bookId: number }): any {
    return http.get("budget/get-budgets-by-book", params);
}

export function setBookBudget(params: { bookId: number, totalBudget?: number, usedBudget?: number }): any {
    return http.post("budget/set-book-budget", params);
}

export function updateBudget(params: { budgetId: number, billCategoryId?: number, limit?: number, amount?: number, times?: number }): any {
    return http.post("budget/update-budget", params);
}
