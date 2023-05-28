<script setup>
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from '@vue-flow/background'
import { nextTick, watch, reactive, computed, onMounted } from "vue";
import Sidebar from "@/components/flowChart/Sidebar.vue";
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'

let id = 0;
function getId() {
  return `dnd${id++}`;
}

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const vueFlowValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    if (value !== vueFlowValue.value) {
      const data = value.map((node) => {
        return {
          id: node.id,
          type: node.type,
          label: node.label,
          position: node.position,
          style: node.style,
          class: node.Class,
          hidden: node.hidden,
          animated: node.animated,
          source: node.source,
          target: node.target,
          labelBgStyle: node.labelBgStyle,
        };
      });

      const newValue = JSON.stringify(data, null, 2)
        .replace(/"(\w+)"\s*:/g, "$1:")
        .replace(/["]/g, "'");

      emit("update:modelValue", newValue);

      value.map((node) => {
        if (node.id === nodeId) {
          opts.bg = node.style?.background;
          opts.stroke = node.style?.stroke;
          opts.type = node.type;
          opts.labelBgStyle.fill = node.labelBgStyle?.fill;
          opts.label = node.label;
          opts.hidden = node.hidden;
        }
      });
    }
  },
});

watch(
  () => vueFlowValue.value,
  (newValue) => {
    if (newValue) {
      vueFlowValue.value = newValue.map((node) => {
        if (node.position === undefined) {
          node.position = {
            x: Math.random() * dimensions.value.width,
            y: Math.random() * dimensions.value.height
          };
        }

        return node;
      });
    }
  },
  { deep: true }
);

const {
  onPaneReady,
  findNode,
  onNodeDragStop,
  onConnect,
  onEdgeUpdate,
  updateEdge,
  addEdges,
  addNodes,
  getSelectedElements,
  getElements,
  project,
  vueFlowRef,
  dimensions
} = useVueFlow({
  // nodes: vueFlowValue.value,
});

onPaneReady(({ fitView }) => {
  fitView();
  setTimeout(() => {
    fitView();
  }, 100);
});

onNodeDragStop((e) => {
  const nodes = e.node;
  vueFlowValue.value = vueFlowValue.value.map((node) => {
    if (node.id === nodes.id) {
      node.position = {
        x: Math.round(nodes.position.x),
        y: Math.round(nodes.position.y),
      };
    }
    return node;
  });
});

function onDragOver(event) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
}

function onDrop(event) {
  const type = event.dataTransfer?.getData("application/vueflow");

  const { left, top } = vueFlowRef.value.getBoundingClientRect();

  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  });

  const newNode = {
    id: getId(),
    type,
    position,
    label: `${type} node`,
  };

  addNodes([newNode]);

  // align node position after drop, so it's centered to the mouse
  nextTick(() => {
    const node = findNode(newNode.id);
    const stop = watch(
      () => node.dimensions,
      (dimensions) => {
        if (dimensions.width > 0 && dimensions.height > 0) {
          node.position = {
            x: node.position.x - node.dimensions.width / 2,
            y: node.position.y - node.dimensions.height / 2,
          };
          stop();
        }
      },
      { deep: true, flush: "post" }
    );
  });
}

onConnect((params) => addEdges([params]));
onEdgeUpdate(({ edge, connection }) => updateEdge(edge, connection));

const opts = reactive({
  bg: null,
  stroke: null,
  type: null,
  labelBgStyle: { fill: null },
  label: null,
  hidden: null,
});
let nodeId = "1";
let edgeType = false;

onMounted(() => {
  const nodes = getElements.value;
  nodes.map((node) => {
    if (node.id === nodeId) {
      if (nodeId.slice(0, 1) === "e" || nodeId.slice(0, 1) === "v") {
        edgeType = true
      } else {
        edgeType = false;
      }
      opts.label = node.label ? node.label : "";
      opts.hidden = node.hidden;
      if (node.style) {
        opts.bg = node.style.backgroundColor;
      }
      if (edgeType) {
        if (node.labelBgStyle) {
          opts.labelBgStyle.fill = node.labelBgStyle.fill ? node.labelBgStyle.fill : "";
        }
        opts.animated = node.animated ? node.animated : false;
        opts.type = node.type ? node.type : "default";
        if (node.style) {
          opts.stroke = node.style.stroke ? node.style.stroke : "";
        }
      }
    }
  })
})

function selectNode() {
  const selected = getSelectedElements.value[0];
  if (!selected) {
    return;
  }
  nodeId = selected.id;
  if (nodeId.slice(0, 1) === "e" || nodeId.slice(0, 1) === "v") {
    edgeType = true
  } else {
    edgeType = false;
  }

  opts.label = selected.label ? selected.label : "";
  opts.hidden = selected.hidden;
  opts.bg = selected.style ? selected.style.backgroundColor : "";

  if (edgeType) {
    opts.labelBgStyle.fill = selected.labelBgStyle ? selected.labelBgStyle.fill : "";
    opts.animated = selected.animated ? selected.animated : false;
    opts.type = selected.type ? selected.type : "default";
    opts.stroke = selected.style ? selected.style.stroke : "";
  }
}
function updateNode(name) {
  vueFlowValue.value = vueFlowValue.value.map((node) => {
    if (node.id === nodeId) {
      if (name === "label") {
        node.label = opts.label !== "" ? opts.label : "";
      }
      if (name === "bg") {
        node.style = { backgroundColor: opts.bg };
      }
      if (name === "hidden") {
        node.hidden = opts.hidden;
      }
      if (edgeType) {
        if (name === "stroke") {
          node.style = { stroke: opts.stroke };
        }
        if (name === "labelBgStyle") {
          node.labelBgStyle = { fill: opts.labelBgStyle.fill };
        }
        if (name === "animated") {
          node.animated = opts.animated;
        }
        if (name === "type") {
          node.type = opts.type;
        }
      }
    }
    return node;
  });
}
</script>

<template>
  <div class="dndflow" @drop="onDrop" @click="selectNode">
    <Sidebar />
    <VueFlow v-model="vueFlowValue" :only-render-visible-elements="true" fit-view-on-init class="basicflow"
      :edges-updatable="true" :zoom-on-double-click="false" :default-viewport="{ zoom: 1.5 }" :min-zoom="0.2"
      :max-zoom="4" @dragover="onDragOver">
      <Background />
      <div class="updatenode__controls">
        <div>
          <input v-model="opts.label" @input="updateNode('label')" placeholder="label" />
        </div>

        <div v-if="!edgeType">
          <label class="updatenode__bglabel">background:</label>
          <input v-model="opts.bg" type="color" @input="updateNode('bg')" />
        </div>

        <div v-if="edgeType">
          <label class="updatenode__bglabel">storke:</label>
          <input v-model="opts.stroke" type="color" @input="updateNode('stroke')" />
        </div>

        <div v-if="edgeType && opts.labelBgStyle">
          <label class="updatenode__bglabel">labelBgStyle:</label>
          <input v-model="opts.labelBgStyle.fill" type="color" @input="updateNode('labelBgStyle')" />
        </div>

        <div v-if="edgeType">
          <label class="updatenode__bglabel">type:</label>
          <select v-model="opts.type" @change="updateNode('type')">
            <option value="default">default</option>
            <option value="smoothstep">smoothstep</option>
            <option value="step">step</option>
          </select>
        </div>

        <div class="updatenode__checkboxwrapper">
          <label>hidden:</label>
          <input v-model="opts.hidden" type="checkbox" @change="updateNode('hidden')" />
        </div>

        <div class="updatenode__checkboxwrapper" v-if="edgeType">
          <label>animated:</label>
          <input v-model="opts.animated" type="checkbox" @change="updateNode('animated')" />
        </div>
      </div>
      <MiniMap />

      <Controls />
    </VueFlow>
  </div>
</template>

<style lang="scss">
/* import the required styles */
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/controls@latest/dist/style.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/minimap@latest/dist/style.css';

.vue-flow__minimap {
  transform: scale(75%);
  transform-origin: bottom right;
}

.vue-flow__node {
  word-break: break-word;
}

.basicflow.dark {
  background: #57534e;
  color: #fffffb;
}

.basicflow.dark .vue-flow__node {
  background: #292524;
  color: #fffffb;
}

.basicflow.dark .vue-flow__controls .vue-flow__controls-button {
  background: #292524;
  fill: #fffffb;
  border-color: #fffffb;
}

.basicflow.dark .vue-flow__edge-textbg {
  fill: #292524;
}

.basicflow.dark .vue-flow__edge-text {
  fill: #fffffb;
}

.basicflow .controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.basicflow .controls button {
  padding: 4px;
  border-radius: 5px;
  font-weight: 600;
  -webkit-box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.3);
  box-shadow: 0 5px 10px #0000004d;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.basicflow .controls button:hover {
  transform: scale(102%);
  transition: 0.25s all ease;
}

.dndflow {
  flex-direction: column;
  display: flex;
  height: 100%;
}

.dndflow aside {
  color: #fff;
  font-weight: 700;
  border-right: 1px solid #eee;
  padding: 10px;
  padding-bottom: 0;
  font-size: 12px;
  background: rgba(16, 185, 129, 0.75);
  -webkit-box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.3);
  box-shadow: 0 5px 10px #0000004d;
}

.dndflow aside .nodes>* {
  margin-bottom: 10px;
  cursor: grab;
  font-weight: 500;
  -webkit-box-shadow: 5px 5px 10px 2px rgba(0, 0, 0, 0.25);
  box-shadow: 5px 5px 10px 2px #00000040;
}

.dndflow aside .description {
  margin-bottom: 10px;
  text-align: center;
}

.dndflow .vue-flow-wrapper {
  flex-grow: 1;
  height: 100%;
}

@media screen and (max-width: 639px) {
  .dndflow aside .nodes {
    display: flex;
    flex-direction: row;
    gap: 5px;
  }
}

.updatenode__controls {
  position: absolute;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  right: 10px;
  top: 10px;
  z-index: 4;
  font-size: 11px;
  background-color: #d3d3d3;
  border-radius: 10px;
  padding: 8px;
  padding-bottom: 0;

  >div {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }
}

.updatenode__controls label {
  display: blocK;
  margin-right: 4px;
  margin-left: 8px;
}

.updatenode__controls input {
  padding: 2px;
  border-radius: 5px;
}

.updatenode__bglabel {
  margin: 0 4px;
}

.updatenode__checkboxwrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}</style>
