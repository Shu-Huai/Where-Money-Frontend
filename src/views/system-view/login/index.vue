<template>
    <div :style="{ backgroundColor: bgColor }" class="flex justify-center items-center h-screen">
        <dark-mode-switch
            :dark="theme.darkMode"
            class="absolute left-48px top-24px z-3 text-20px"
            @update:dark="theme.setDarkMode"
        />
        <div class="relative s-card p-14 z-4 w-9/10 xl:w-auto">
            <Icon icon="ic:baseline-account-balance-wallet" class="absolute z-4 w-13 h-13 text-primary top-5 left-5"/>
            <div class="text-6xl font-bold italic text-primary mb-13 mt-5 text-center">
                <span class="underline decoration-teal-500 decoration-6">Where</span> Money
            </div>
            <n-form id="form" ref="formRef" :model="formValue" :rules="rules" :show-label="false">
                <n-form-item label="用户名" path="userName">
                    <n-input v-model:value="formValue.userName" :round="true" class="p-2" placeholder="账号"/>
                </n-form-item>
                <n-form-item label="密码" path="password">
                    <n-input
                        v-model:value="formValue.password"
                        :round="true"
                        class="p-2"
                        placeholder="密码"
                        type="password"
                        @keyup.enter="PostLogin"
                    />
                </n-form-item>
                <n-form-item>
                    <n-checkbox v-model:checked="needSave">记住我</n-checkbox>
                </n-form-item>
                <n-form-item>
                    <n-button
                        :round="true"
                        :secondary="true"
                        attr-type="button"
                        class="w-full py-5 text-lg font-bold"
                        size="large"
                        type="primary"
                        @click="PostLogin"
                    >登录
                    </n-button>
                </n-form-item>
            </n-form>
            <div class="mt-2">
                还没有账号？
                <a id="registerLink" href="../register">点我注册</a>
            </div>
        </div>
        <login-bg :theme-color="bgThemeColor"/>
    </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, Ref, ref} from "vue";
import {Router} from "vue-router";
import {useRouterPush} from "@/composables";
import {getColorPalette, mixColor, storage} from "@/utils";
import {loginApi} from "@/apis/user";
import {useThemeStore} from "@/store";
import {LoginBg} from "./components";
import {DarkModeSwitch} from "@/components";
import {UserLoginResponse} from "@/interface";
import {Icon} from "@iconify/vue";
import {EnumStorageKey} from "@/enum";

const {routerPush} = useRouterPush();
const theme = useThemeStore();
const bgThemeColor = computed(() => (theme.darkMode ? getColorPalette(theme.themeColor, 7) : theme.themeColor));
const bgColor = computed(() => {
    const COLOR_WHITE = "#ffffff";
    const ratio = theme.darkMode ? 0.5 : 0.2;
    return mixColor(COLOR_WHITE, theme.themeColor, ratio);
});
const formValue: Ref<{ userName: string; password: string }> = ref({userName: "", password: ""});
declare const window: Window & { $message: any; $router: Router };
const rules: object = {
    userName: {
        required: true,
        validator(_rule: any, value: string) {
            if (!value) {
                return new Error("请输入邮箱或手机号。");
            }
            if (!/^(\w+@(\w+\.)+\w+)|([0-9]{11})|\w+$/.test(value)) {
                return new Error("请输入正确的邮箱或手机号。");
            }
            return true;
        },
        trigger: "blur"
    },
    password: {
        required: true,
        message: "请输入密码。",
        trigger: ["input", "blur"]
    }
};
const GetCookie = (): void => {
    if (document.cookie.length > 0) {
        const cookie: string[] = document.cookie.split("; ");
        cookie.forEach(function (element): void {
            const result: string[] = element.split("=");
            if (result[0] === "userName") {
                formValue.value.userName = result[1];
            } else if (result[0] === "password") {
                formValue.value.password = result[1];
            }
        });
    }
};
onMounted(() => {
    storage.remove(EnumStorageKey["token"]);
    GetCookie();
});
const formRef: Ref = ref(null);
const needSave: Ref<boolean> = ref(true);
const SetCookie = (userName: string, password: string, exdays: number): void => {
    const exdate: Date = new Date();
    exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays);
    window.document.cookie = `userName` + `=${userName};path=/;expires=${exdate.toUTCString()}`;
    window.document.cookie = `password` + `=${password};path=/;expires=${exdate.toUTCString()}`;
};
const PostLogin = (): void => {
    SetCookie("", "", -1);
    formRef.value.validate((errors: boolean) => {
        if (!errors) {
            loginApi({userName: formValue.value.userName, password: formValue.value.password})
                .then((response: UserLoginResponse) => {
                    window.$message.success("登录成功");
                    const token: string = response.token;
                    storage.set(EnumStorageKey["token"], token);
                    if (needSave.value) {
                        SetCookie(formValue.value.userName, formValue.value.password, 7);
                    }
                    routerPush({name: "home"});
                })
                .catch((_error: {}) => {
                });
        } else {
            window.$message.error("请正确输入信息");
        }
    });
};
defineExpose({formRef, formValue, rules, needSave, PostLogin});
</script>
<style scoped>
label {
    color: white;
}

#registerLink {
    color: #246ace;
}
</style>
