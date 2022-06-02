import http from "@/utils/http";

function addAsset(params: {
    assetName: string, balance?: number, billDate?: number | null, repayDate?: number | null, quota?: number | null,
    inTotal?: boolean
}): any {
    return http.post("asset/add-asset", params);
}

function getAllAsset(): any {
    return http.get("asset/get-all-asset", null);
}

function getAssetApi(params: { id: number }): any {
    return http.get("asset/get-asset", params);
}

function getDayStatisticTime(params: { startTime: string, endTime: string }): any {
    return http.get("asset/day-statistic-time", params);
}

function updateAsset(params: { assetId: number, [key: string]: any }): any {
    return http.post("asset/update-asset", params);
}

export { addAsset, getAllAsset, getAssetApi, getDayStatisticTime, updateAsset };
