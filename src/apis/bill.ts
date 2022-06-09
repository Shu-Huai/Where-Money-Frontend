import http from "@/utils/http";

function addBillApi(params: any): any {
    return http.post("/bill/add-bill", params);
}

function changeBillApi(params: any): any {
    return http.post("/bill/change-bill", params);
}

// 获取指定账本的所有账单
function getAllBillInBookApi(params: { bookId: number }): any {
    return http.get("/bill/all-bill", params);
}

function getAllBillTimeApi(params: { bookId: number, startTime: string, endTime: string }): any {
    return http.get("/bill/all-bill-time", params);
}

// 分日统计指定账本所有账单
function getDayStatisticTimeApi(params: { bookId: number, startTime: string, endTime: string }): any {
    return http.get("/bill/day-statistic-time", params);
}

// 获取指定账本下的所有账单分类
function getBillCategoryApi(params: { bookId: number }): any {
    return http.get("/bill/get-bill-category", params);
}

//分类统计指定账本指定日期内的账单
function getCategoryStatisticTimeApi(params: { bookId: Number, startTime: string, endTime: string }): any {
    return http.get("/bill/category-statistic-time", params);
}

function getMaxMinPayTimeApi(params: { bookId: Number, startTime: string, endTime: string }): any {
    return http.get("/bill/max-min-pay-time", params);
}

function getMaxMinIncomeTimeApi(params: { bookId: Number, startTime: string, endTime: string }): any {
    return http.get("/bill/max-min-income-time", params);
}

function getBillImageApi(params: { billId: number, type: string }): any {
    return http.get("/bill/bill-image", params);
}

export {
    addBillApi,
    changeBillApi,
    getAllBillInBookApi,
    getAllBillTimeApi,
    getDayStatisticTimeApi,
    getBillCategoryApi,
    getCategoryStatisticTimeApi,
    getMaxMinPayTimeApi,
    getMaxMinIncomeTimeApi,
    getBillImageApi
};
