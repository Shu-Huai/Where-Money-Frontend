import http from "@/utils/http";

export function addBudget(params: { bookId: number, billCategoryId: number, limit: number }): any {
    return http.post("budget/budget", params);
}

export function getBudgetsByBook(params: { bookId: number }): any {
    return http.get("budget/budget/all", params);
}

export function setBookBudget(params: { bookId: number, totalBudget?: number, usedBudget?: number }): any {
    return http.patch("budget/budget/total", params);
}

export function updateBudget(params: {
    budgetId: number,
    billCategoryId?: number,
    limit?: number,
    amount?: number,
    times?: number
}): any {
    return http.patch("budget/budget", params);
}
