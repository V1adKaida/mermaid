<script setup>
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { nextTick, watch, reactive, computed } from "vue";
import Sidebar from "@/components/Sidebar.vue";
import console from 'console';

let id = 0;
function getId() {
  return `dndnode_${id++}`;
}

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue", "nodesPosition"]);

const vueFlowValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    if (value !== vueFlowValue.value) {
      // console.log("vueFlowValue set", value);
      emit("update:modelValue", value);
    }
  },
});

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
  getNode,
  getEdge,
  project,
  vueFlowRef,
} = useVueFlow({
  nodes: vueFlowValue.value,
});

onPaneReady(({ fitView }) => {
  fitView();
  setTimeout(() => {
    fitView();
  }, 100);
});

onNodeDragStop((e) => {
  emit("nodesPosition", e.node);
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
onEdgeUpdate(({ edge, connection }) => updateEdge(edge, connection))

const opts = reactive({
  bg: "#ffffff",
  label: "Node 1",
  hidden: false,
});
let nodeId = '1';
let nodeAnimated = false;

function selectNode() {
  const selected = getSelectedElements.value[0];
  if (!selected) {
    return;
  }
  nodeId = selected.id;
  const node = nodeId.slice(0, 1) !== "e" ? getNode.value(nodeId) : getEdge.value(nodeId);
  // console.log("selectNode", node);
  opts.label = node.label !== "" ? selected.label : "";
  if (node.style) {
    opts.bg = node.style.backgroundColor;
  } else {
    opts.bg = "#ffffff";
  }
  opts.hidden = selected.hidden;
  if (nodeId.slice(0, 1) === "e") {
    nodeAnimated = true;
    opts.animated = selected.animated || false;
  } else {
    nodeAnimated = false;
  }
}

function updateNode() {
  const nodeStyles = nodeId.slice(0, 1) !== "e" ? getNode.value(nodeId) : getEdge.value(nodeId);
  nodeStyles.style = { backgroundColor: opts.bg };
  nodeStyles.hidden = opts.hidden;

  vueFlowValue.value = vueFlowValue.value.map((node) => {
    if (node.id === nodeId) {
      node.label = opts.label !== "" ? opts.label : "";
      node.animated = opts.animated;
    }
    return node
  });
}
</script>

<template>
  <div class="dndflow" @drop="onDrop" @click="selectNode">
    <Sidebar />
    <VueFlow
      v-model="vueFlowValue"
      class="basicflow"
      :edges-updatable="true"
      fit-view-on-init
      :default-viewport="{ zoom: 1.5 }"
      :min-zoom="0.2"
      :max-zoom="4"
      @dragover="onDragOver"
    >
      <div class="updatenode__controls">
       <div>
         <input v-model="opts.label" @input="updateNode" placeholder="label" />
       </div>

        <div>
          <label class="updatenode__bglabel">background:</label>
        <input v-model="opts.bg" type="color" @input="updateNode" />
        </div>

        <div class="updatenode__checkboxwrapper">
          <label>hidden:</label>
          <input v-model="opts.hidden" type="checkbox" @change="updateNode" />
        </div>

         <div class="updatenode__checkboxwrapper" v-if="nodeAnimated">
          <label>animated:</label>
          <input v-model="opts.animated" type="checkbox" @change="updateNode" />
        </div>
      </div>
    </VueFlow>
  </div>
</template>

<style lang="scss">
@import "https://cdn.jsdelivr.net/npm/@vue-flow/core@1.19.0/dist/style.css";
@import "https://cdn.jsdelivr.net/npm/@vue-flow/core@1.19.0/dist/theme-default.css";
@import "https://cdn.jsdelivr.net/npm/@vue-flow/controls@latest/dist/style.css";
@import "https://cdn.jsdelivr.net/npm/@vue-flow/node-resizer@latest/dist/style.css";

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
  padding: 15px 10px;
  font-size: 12px;
  background: rgba(16, 185, 129, 0.75);
  -webkit-box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.3);
  box-shadow: 0 5px 10px #0000004d;
}
.dndflow aside .nodes > * {
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

  >div{
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
}
</style>
