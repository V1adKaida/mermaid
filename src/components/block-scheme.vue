<script setup>
import { VueFlow, useVueFlow, MarkerType } from "@vue-flow/core";
import { nextTick, watch, ref } from "vue";
import Sidebar from "@/components/Sidebar.vue";

let id = 0;
function getId() {
  return `dndnode_${id++}`;
}

const props = defineProps(['code'])

// console.log(JSON.stringify(props.code, null, 2))
const copyCode = ref(props.code)

const initialElements = [
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

const elements = ref(initialElements)

const {
  onPaneReady,
  findNode,
  onNodeDragStop,
  onConnect,
  addEdges,
  addNodes,
  project,
  vueFlowRef,
} = useVueFlow({
  nodes: elements
});

onPaneReady(({ fitView }) => {
  fitView();
  setTimeout(() => {
    fitView();
  }, 100);
  console.log("pane ready");
});

onNodeDragStop((e) => console.log("drag stop", e));

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
</script>

<template>
  <div class="dndflow" @drop="onDrop">

    <Sidebar />
    <VueFlow
      :v-model="copyCode"
      class="basicflow"
      :default-viewport="{ zoom: 1.5 }"
      :min-zoom="0.2"
      :max-zoom="4"
      @dragover="onDragOver"
    >
    </VueFlow>
  </div>
</template>

<style>
@import "https://cdn.jsdelivr.net/npm/@vue-flow/core@1.19.0/dist/style.css";
@import "https://cdn.jsdelivr.net/npm/@vue-flow/core@1.19.0/dist/theme-default.css";
@import "https://cdn.jsdelivr.net/npm/@vue-flow/controls@latest/dist/style.css";
@import "https://cdn.jsdelivr.net/npm/@vue-flow/node-resizer@latest/dist/style.css";

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
</style>
