<script setup>
import { VueFlow, useVueFlow, MarkerType } from "@vue-flow/core";
import { nextTick, watch, ref, reactive, computed} from "vue";
import Sidebar from "@/components/Sidebar.vue";

let id = 0;
function getId() {
  return `dndnode_${id++}`;
}

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'nodesPosition'])
// const copyCode = ref(props.modelValue)

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    console.log("set value", value)
    emit('update:modelValue', value)
  }
})

const defaultLabel = '-'
const {
  onPaneReady,
  findNode,
  onNodeDragStop,
  onConnect,
  addEdges,
  addNodes,
  getNode,
  project,
  vueFlowRef,
} = useVueFlow({
  nodes: props.modelValue
});

onPaneReady(({ fitView }) => {
  fitView();
  setTimeout(() => {
    fitView();
  }, 100);
});

onNodeDragStop((e)=>{
  console.log("drag stop", e.node)
  emit('nodesPosition', e.node)
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

const opts = reactive({
  bg: '#eeeeee',
  label: 'Node 1',
  hidden: false,
})

function updateNode() {
  const node = getNode.value('1')
  node.label = opts.label.trim() !== '' ? opts.label : defaultLabel
  node.style = { backgroundColor: opts.bg }
  node.hidden = opts.hidden
}
</script>

<template>
  <div class="dndflow" @drop="onDrop">
    <!-- {{ value }} -->
    <Sidebar />
    <VueFlow
      v-model="value"
      class="basicflow"
      fit-view-on-init
      :default-viewport="{ zoom: 1.5 }"
      :min-zoom="0.2"
      :max-zoom="4"
      @dragover="onDragOver"
    >
    <div class="updatenode__controls">
      <label>label:</label>
      <input v-model="opts.label" @input="updateNode" />

      <label class="updatenode__bglabel">background:</label>
      <input v-model="opts.bg" type="color" @input="updateNode" />

      <div class="updatenode__checkboxwrapper">
        <label>hidden:</label>
        <input v-model="opts.hidden" type="checkbox" @change="updateNode" />
      </div>
    </div>
    </VueFlow>
  </div>
</template>

<style>
@import "https://cdn.jsdelivr.net/npm/@vue-flow/core@1.19.0/dist/style.css";
@import "https://cdn.jsdelivr.net/npm/@vue-flow/core@1.19.0/dist/theme-default.css";
@import "https://cdn.jsdelivr.net/npm/@vue-flow/controls@latest/dist/style.css";
@import "https://cdn.jsdelivr.net/npm/@vue-flow/node-resizer@latest/dist/style.css";

.vue-flow__node{
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

.updatenode__controls{position:absolute;right:10px;top:10px;z-index:4;font-size:11px;background-color:#d3d3d3;border-radius:10px;padding:8px}.updatenode__controls label{display:blocK}.updatenode__controls input{padding:2px;border-radius:5px}.updatenode__bglabel{margin-top:8px}.updatenode__checkboxwrapper{display:flex;justify-content:center;align-items:center;margin-top:8px}
</style>
