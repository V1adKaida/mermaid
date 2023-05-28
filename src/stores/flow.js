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

        //       {
        //         name: 'Test Flow',
        //         code: `[
        //   {
        //   id: '1',
        //   type: 'input',
        //   label: 'Node 1',
        //   position: {
        //     x: 250,
        //     y: 1
        //   },
        //   class: 'light'
        // },
        // {
        //   id: '2',
        //   type: 'output',
        //   label: 'Node 2',
        //   position: {
        //     x: 100,
        //     y: 100
        //   },
        //   class: 'light'
        // },
        // {
        //   id: '3',
        //   label: 'Node 3',
        //   position: {
        //     x: 400,
        //     y: 100
        //   },
        //   class: 'light'
        // },
        // {
        //   id: '4',
        //   label: 'Node 4',
        //   position: {
        //     x: 150,
        //     y: 200
        //   },
        //   class: 'light'
        // },
        // {
        //   id: '5',
        //   type: 'output',
        //   label: 'Node 5',
        //   position: {
        //     x: 300,
        //     y: 300
        //   },
        //   class: 'light'
        // },
        // {
        //   id: 'e1-2',
        //   source: '1',
        //   target: '2',
        //   animated: true
        // },
        // {
        //   id: 'e1-3',
        //   label: 'edge with arrowhead',
        //   source: '1',
        //   target: '3'
        // },
        // {
        //   id: 'e4-5',
        //   type: 'step',
        //   label: 'step-edge',
        //   source: '4',
        //   target: '5',
        //   style: {
        //     stroke: 'orange'
        //   },
        //   labelBgStyle: {
        //     fill: 'orange'
        //   }
        // },
        // {
        //   id: 'e3-4',
        //   type: 'smoothstep',
        //   label: 'smoothstep-edge',
        //   source: '3',
        //   target: '4'
        // }
        // ]`
        //       }