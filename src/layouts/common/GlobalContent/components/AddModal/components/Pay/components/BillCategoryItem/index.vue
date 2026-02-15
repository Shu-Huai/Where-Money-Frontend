<template>
    <div>
        <div class="space-y-2 text-center cursor-pointer py-2 rounded" v-bind:class="{'bg-primary-active':chosen}"
             v-on:click="setChosen">
            <div>
                <Icon :icon="billCategory.svg || 'icon-park-outline:tag'"
                      class="text-primary lg:w-8 lg:h-8 m-auto h-5 w-5"/>
            </div>
            <div class="text-xs lg:text-base">
                {{ billCategory.billCategoryName }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { Ref, ref, watch } from "vue";
import { useStore } from "@/stores/store";

let store = useStore();
const props: any = defineProps({
    billCategory: Object
});
let chosen: Ref<boolean> = ref(false);
watch(() => store.selectedBillCategoryId, (newValue) => {
    chosen.value = newValue === props.billCategory.id;
});

function setChosen() {
    store.selectedBillCategoryId = props.billCategory.id;
}
</script>

<style scoped>

</style>
