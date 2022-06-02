import { LoadingBarApi } from "naive-ui";
import axios from "axios";
import router from "@/router";
import { storage } from "../utils";
import qs from "qs";

const service = (axios as any).create({
    baseURL: import.meta.env.VITE_APP_INTERFACE_URL,
    timeout: 600 * 1000
});
service.interceptors.request.use(
    (config: any) => {
        const token = storage.get("token");
        if (token) {
            config.headers.authorization = `Bearer ${token}`;
        }
        if (config.method === "post" && config.url !== "/bill/add-bill") {
            config.data = qs.stringify(config.data);
        }
        return config;
    },
    (error: any) => {
        console.log(error);
        return Promise.reject(error);
    }
);
declare const window: Window & { $message: any; $loadingBar: LoadingBarApi };
service.interceptors.response.use(
    (response: any) => {
        const res: any = response.data;
        if (res.code === 200) {
            console.log(`请求${response.config.baseURL}${response.config.url}成功，返回：`);
            console.log(res.data);
            return Promise.resolve(res.data);
        } else {
            if (res && res.code) {
                // 1.公共错误处理
                // 2.根据响应码具体处理
                console.log(`请求${response.config.baseURL}${response.config.url}失败，返回：`);
                console.log(res);
                switch (res.code) {
                    case 400:
                        window.$message.error(res.message);
                        break;
                    case 401:
                        storage.remove("token");
                        switch (res.message) {
                            case "账户或密码错误":
                                window.$message.error("账户或密码错误");
                                break;
                            case "token无效":
                            case "token过期":
                                window.$message.error("未授权或授权失效，请重新登录");
                                router.push({ name: "login" }).then(_r => {
                                });
                                break;
                        }
                        break;
                    case 403:
                        break;
                    case 404:
                        window.$message.error("请求错误");
                        break;
                    case 405:
                        break;
                    case 408:
                        break;
                    case 422:
                        window.$message.error("请求参数错误");
                        break;
                    case 500:
                        window.$message.error("服务器错误");
                        break;
                    case 501:
                        break;
                    case 502:
                        window.$message.error("网络错误");
                        break;
                    case 503:
                        break;
                    case 504:
                        break;
                    case 505:
                        break;
                    default:
                        console.log(`连接错误${res.code}`);
                }
            } else {
                window.$message.error("连接服务器失败");
            }
            window.$loadingBar.error();
            return Promise.reject(res);
        }
    },
    (error: any) => {
        if (JSON.stringify(error).includes("timeout")) {
            window.$message.error("连接服务器失败");
        }
        window.$loadingBar.error();
        return Promise.reject(error);
    }
);
export default service;
