<template>
  <header>
    <div class="container">
      <div class="left">
        <h1>FlowChart</h1>
        <select v-if="flowStore.flows.length" v-model="flowStore.selectedFlowId">
          <option v-for="item in flowStore.flows" :value="item.id">
            {{ item.name }}
          </option>
        </select>
        <input @keydown.enter="newFlow()" class="input" type="text" v-model="name" placeholder="New flow name" />
        <button :disabled="!name" @click="newFlow()">New Flow</button>
        <button v-if="flowStore.flows.length" class="remove" @click="removeFlow(flowStore.selectedFlowId)">Remove</button>
      </div>

      <div class="user">
        <span>{{ user?.displayName || user?.email }}</span>
        <img :src="user?.photoURL || 'https://avatars.githubusercontent.com/u/499550?v=4'" alt="John Doe" />
        <button v-if="isLoggedIn" @click="handleSignOut"> Logout </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { toast } from 'vue3-toastify'
import { useFlowStore } from '@/stores/flow'

const flowStore = useFlowStore()
const router = useRouter()
const user = useCurrentUser()

const isLoggedIn = ref()

onAuthStateChanged(getAuth(), function (user) {
  if (user) {
    isLoggedIn.value = true // if we have a user
  } else {
    isLoggedIn.value = false // if we do not
    router.push('/auth')
  }
})

const name = ref('')

const newFlow = () => {
  flowStore.newFlow(name.value)
  name.value = ''
  toast('Flow created!', { type: 'success' })
}

const removeFlow = (id) => {
  flowStore.removeFlow(id)
  toast('Flow removed!', { type: 'success' })
}

const handleSignOut = () => {
  signOut(getAuth())
  router.push('/auth')
  flowStore.reset()
}
</script>

<style lang="scss" scoped>
header {
  padding: 0 16px;
  background: #fff;

  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: var(--header-height);
  }

  h1 {
    font-size: 1.5em;
    font-weight: 600;
    margin: 0;
  }

  .left {
    display: flex;
    align-items: center;
  }

  .user {
    display: flex;
    align-items: center;

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-left: 16px;
    }
  }

  button {
    margin-left: 16px;
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    background: #f1f1f1;
    cursor: pointer;
    transition: 0.2s;
    color: #000;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover {
      background: #e1e1e1;
    }

    &.remove {
      background: #f44336;
      color: #fff;

      &:hover {
        background: #e53935;
      }
    }
  }

  .input {
    margin-left: 16px;
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    background: #f1f1f1;
    cursor: pointer;
  }

  select {
    margin-left: 16px;
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    background: #f1f1f1;
    min-width: 100px;
    cursor: pointer;
  }
}
</style>