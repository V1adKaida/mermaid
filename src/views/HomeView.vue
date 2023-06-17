<template>
  <div class="wrapper">
    <div>
      <Codemirror :modelValue="flowStore.selectedFlow"
        @update:modelValue="(newValue) => flowStore.updateFlow(newValue)"
        placeholder="Code goes here..." :style="{ height: '100%' }" :autofocus="true" :indent-with-tab="true"
        :tab-size="2" :extensions="extensions" @ready="handleReady" @focus="permision = false" @blur="permision = true" />
    </div>
    <div>
      <VueFlow v-model="codeObj"></VueFlow>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed } from "vue";
import { Codemirror } from "vue-codemirror";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import VueFlow from "@/components/flowChart/VueFlow.vue";
import { useFlowStore } from '@/stores/flow';
import { useDatabaseList } from 'vuefire'
import { getDatabase, ref as dbRef } from "firebase/database";
const flowStore = useFlowStore();
const db = getDatabase();

flowStore.flows = useDatabaseList(dbRef(db, `users/${flowStore.userId}/flows`))

const extensions = [json(), oneDark];

// Codemirror EditorView instance ref
const view = shallowRef();
const handleReady = (payload) => {
  view.value = payload.view;
};

const permision = ref(true);

const codeObj = computed({
  get() {
    if (flowStore.selectedFlow) {
      const validator = () => {
        try {
          eval(flowStore.selectedFlow);
          return true;
        } catch (e) {
          return false;
        }
      };

      if (validator() === true) {
        const validateId = eval(flowStore.selectedFlow).every((item) => {
          return item.id;
        });

        if (validateId) {
          return eval(flowStore.selectedFlow);
        }
      }
    }
  },

  set(newValue) {
    const hasPermission = permision.value;
    const isDifferentFlow = newValue !== flowStore.selectedFlow;
    if (hasPermission && isDifferentFlow) {
      flowStore.updateFlow(newValue);
    }
  }

});
</script>

<style lang="scss">
.wrapper {
  display: flex;
  max-width: 1600px;
  height: calc(100vh - var(--header-height));

  >div {
    width: 100%;

    &:first-child {
      width: 400px;
      min-width: 400px;
    }
  }
}

.CodeMirror {
  font-size: 14px;
}
</style>
