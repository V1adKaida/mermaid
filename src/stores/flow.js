import { defineStore } from 'pinia'
import { getDatabase, ref, child, push, update, set, remove } from "firebase/database";

export const useFlowStore = defineStore('flow', {
  state: () => {
    return {
      user: null,
      flows: [],
      selectedFlowId: 0,
    }
  },
  getters: {
    selectedFlow: (state) => {
      return state.flows.find((flow) => Number(flow.id) === Number(state.selectedFlowId))?.code
    },
    userId: (state) => {
      return state.user?.uid
    }
  },
  actions: {
    newFlow(name) {
      const db = getDatabase();
      const id = typeof this.flows[0] !== 'undefined' ? Number(this.flows[this.flows.length - 1].id) + 1 : 0
      set(ref(db, `users/${this.userId}/flows/${id}`), {
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

      this.selectedFlowId = id
    },
    updateFlow(newValue) {
      const db = getDatabase();
      const updates = {}
      updates[`users/${this.userId}/flows/${this.selectedFlowId}/code`] = newValue
      update(ref(db), updates)
    },
    removeFlow(id) {
      const db = getDatabase();
      remove(ref(db, `users/${this.userId}/flows/${id}`))
      this.selectedFlowId = this.flows[0].id
    },
    reset() {
      this.$reset()
    }
  },
  persist: {
    paths: ['user', 'selectedFlowId'],
  }
})