<template>
  <div class="wrapper">
    <div>
      <Codemirror
        v-model="code"
        placeholder="Code goes here..."
        :style="{ height: '100%' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="extensions"
        @ready="handleReady"
      />
    </div>
    <div>
      <VueFlow v-model="codeObj" @nodes-position="nodesPosition"></VueFlow>
    </div>
  </div>
</template>

<script>
import { ref, shallowRef, computed, reactive } from "vue";
import { Codemirror } from "vue-codemirror";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import VueFlow from "../components/VueFlow.vue";

export default {
  name: "HomeView",
  components: {
    VueFlow,
    Codemirror,
  },
  setup() {
    const extensions = [json(), oneDark];

    // Codemirror EditorView instance ref
    const view = shallowRef();
    const handleReady = (payload) => {
      view.value = payload.view;
    };

        const code = ref(
      `[
  {
    id: '1',
    type: 'input',
    label: 'Node 1',
    position: {
      x: 250,
      y: 1
    },
    class: 'light'
  },
  {
    id: '2',
    type: 'output',
    label: 'Node 2',
    position: {
      x: 100,
      y: 100
    },
    class: 'light'
  },
  {
    id: '3',
    label: 'Node 3',
    position: {
      x: 400,
      y: 100
    },
    class: 'light'
  },
  {
    id: '4',
    label: 'Node 4',
    position: {
      x: 150,
      y: 200
    },
    class: 'light'
  },
  {
    id: '5',
    type: 'output',
    label: 'Node 5',
    position: {
      x: 300,
      y: 300
    },
    class: 'light'
  },
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true
  },
  {
    id: 'e1-3',
    label: 'edge with arrowhead',
    source: '1',
    target: '3'
  },
  {
    id: 'e4-5',
    type: 'step',
    label: 'step-edge',
    source: '4',
    target: '5',
    style: {
      stroke: 'orange'
    },
    labelBgStyle: {
      fill: 'orange'
    }
  },
  {
    id: 'e3-4',
    type: 'smoothstep',
    label: 'smoothstep-edge',
    source: '3',
    target: '4'
  }
]
`
    );

    const codeObj = computed({
      // getter
      get() {
        return eval(code.value);
      },
      // setter
      set(newValue) {
        if (newValue !== eval(code.value)) {
          if (typeof newValue === "string") {
            eval(newValue);
          } else {
            console.log('codeObj', newValue);
            newValue.forEach(element => {
              
            });
            const data = newValue.map((element)=>{
              return {
                id: element.id,
                type: element.type,
                label: element.label,
                position: element.position,
                animated: element.animated,
                style: element.style,
                labelBgStyle: element.labelBgStyle,
                source: element.source,
                taeget: element.taeget,
                class: element.class,
              }
            })
            // code.value = JSON.stringify(data, null, 2)
            //   .replace(/"(\w+)"\s*:/g, "$1:")
            //   .replace(/["]/g, "'");
          }
        }
      },
    });

    function nodesPosition(nodes) {
      const data = codeObj.value.map((node) => {
        if (node.id === nodes.id) {
          node.position = {
            x: Math.round(nodes.position.x),
            y: Math.round(nodes.position.y),
          };
        }
        return node;
      });
      code.value = JSON.stringify(data, null, 2)
        .replace(/"(\w+)"\s*:/g, "$1:")
        .replace(/["]/g, "'");
    }

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
