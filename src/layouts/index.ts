import BasicLayoutComponent from "./BasicLayout/index.vue";
import BlankLayoutComponent from "./BlankLayout/index.vue";

const BasicLayout = () => Promise.resolve(BasicLayoutComponent);
const BlankLayout = () => Promise.resolve(BlankLayoutComponent);

export {BasicLayout, BlankLayout};
