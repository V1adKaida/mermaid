import { defineStore } from 'pinia'
import { getDatabase, ref, update, set, remove, } from "firebase/database";

export const useFlowStore = defineStore('flow', {
  state: () => {
    return {
      user: null,
      flows: [],
      selectedFlowId: '0',
    }
  },
  getters: {
    selectedFlow: (state) => {
      if (state.flows.length) {
        return state.flows.find((flow) => Number(flow.id) === Number(state.selectedFlowId))?.code
      } else {
        return null
      }
    },
    userId: (state) => {
      return state.user?.uid
    }
  },
  actions: {
    newFlow(name) {
      const database = getDatabase();
      const id = typeof this.flows[0] !== 'undefined' ? Number(this.flows[this.flows.length - 1].id) + 1 : 0
      set(ref(database, `users/${this.userId}/flows/${id}`), {
        id: id,
        name: name,
        code: `[
  {
    id: '1',
    type: 'input',
    label: '${name}',
    position: {
      x: 250,
      y: 1
    },
  }
]`
      });
      console.log(this.flows.length)
      this.selectedFlowId = `${id}`
    },
    updateFlow(newValue) {
      const database = getDatabase();
      const updates = {}
      updates[`users/${this.userId}/flows/${this.selectedFlowId}/code`] = newValue
      update(ref(database), updates)
    },
    removeFlow(flowId) {
      const database = getDatabase();
      remove(ref(database, `users/${this.userId}/flows/${flowId}`));
      this.flows.length > 0 ? this.selectedFlowId = `${flowId - 1}` : this.selectedFlowId = ``
    },
    reset() {
      this.$reset()
    }
  },
  persist: {
    paths: ['user', 'selectedFlowId'],
  }
})