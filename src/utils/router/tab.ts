import { EnumStorageKey } from "@/enum";
import type { GlobalTabRoute } from "@/interface";
import { getLocal, setLocal } from "../storages";

/** 缓存多页签数据 */
export function setTabRoutes(data: GlobalTabRoute[]) {
    setLocal(EnumStorageKey["tabRoutes"], data);
}

/** 获取缓存的多页签数据 */
export function getTabRoutes() {
    const routes: GlobalTabRoute[] = [];
    const data = getLocal<GlobalTabRoute[]>(EnumStorageKey["tabRoutes"]);
    if (data) {
        const defaultTabRoutes = data.map((item: any) => ({
            ...item,
            scrollPosition: {
                left: 0,
                top: 0
            }
        }));
        routes.push(...defaultTabRoutes);
    }
    return routes;
}