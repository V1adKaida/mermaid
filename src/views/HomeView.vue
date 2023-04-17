<template>
  <!-- {{ codeObj }} -->
  <div class="wrapper">
    <div>
      <codemirror
        v-model="code"
        placeholder="Code goes here..."
        :style="{ height: '400px' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="extensions"
        @ready="handleReady"
      />
    </div>
    <div>
      <VueFlow v-model="codeObj" @nodesPosition="nodesPosition"></VueFlow>
    </div>
  </div>
</template>

<script>
 import { ref, shallowRef,computed } from 'vue'
import { Codemirror } from "vue-codemirror";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import VueFlow from "../components/VueFlow.vue";
import { MarkerType } from "@vue-flow/core";

export default {
  name: "HomeView",
  components: {
    VueFlow,
    Codemirror,
  },
  setup() {

    const codeObj = computed({
      // getter
      get() {
        return eval(code.value)
      },
      // setter
      set(newValue) {
        if (newValue !== code.value) {
          const data = newValue.map(({ id, type, label, position, class: className }) => ({
            id,
            type,
            label,
            position,
            class: className,
          }));
          code.value = JSON.stringify(data, null, 2);
          console.log(data);
        }
      }
    })

    const nodesPosition = (nodes) => {
      codeObj.value.map((node) => node.id === nodes.id).position = nodes.position;
    }

    const code = ref(
      `[
  { id: '1', type: 'input', label: 'Node 1', position: { x: 250, y: 0 }, class: 'light' },
  { id: '2', type: 'output', label: 'Node 2', position: { x: 100, y: 100 }, class: 'light' },
  { id: '3', label: 'Node 3', position: { x: 400, y: 100 }, class: 'light' },
  { id: '4', label: 'Node 4', position: { x: 150, y: 200 }, class: 'light' },
  { id: '5', type: 'output', label: 'Node 5', position: { x: 300, y: 300 }, class: 'light' },
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', label: 'edge with arrowhead', source: '1', target: '3', markerEnd: MarkerType.ArrowClosed },
  {
    id: 'e4-5',
    type: 'step',
    label: 'step-edge',
    source: '4',
    target: '5',
    style: { stroke: 'orange' },
    labelBgStyle: { fill: 'orange' },
  },
  { id: 'e3-4', type: 'smoothstep', label: 'smoothstep-edge', source: '3', target: '4' },
]
`
    );

    const extensions = [json(), oneDark];

    // Codemirror EditorView instance ref
    const view = shallowRef();
    const handleReady = (payload) => {
      view.value = payload.view;
    };

    return {
      code,
      codeObj,
      extensions,
      handleReady,
      nodesPosition,
      log: console.log,
    };
  },
};
</script>

<style lang="scss">
.wrapper {
  display: flex;
  margin: 0 -15px;
  height: 100%;
  > div {
    padding: 0 15px;
    width: 50%;
  }
}

.CodeMirror {
  font-size: 14px;
}
</style>
