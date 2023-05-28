
<template>
  <div id="login">
    <div id="description" v-if="state === 'login'">
      <h1>Login</h1>
      <p>By logging in you agree to the ridiculously long terms that you didn't bother to read.</p>
    </div>
    <div id="description" v-if="state === 'singup'">
      <h1>Sing up</h1>
      <p>
        By creating an account you agree to the ridiculously long terms that you didn't bother to read.
      </p>
    </div>
    <div id="form">
      <form @submit.prevent="Login" v-if="state === 'login'">
        <label for="email">Email</label>
        <input type="text" id="email" v-model="email" placeholder="elon@musk.io" autocomplete="off">

        <label for="password">Password</label>&nbsp;
        <i class="fas" :class="[passwordFieldIcon]" @click="hidePassword = !hidePassword"></i>
        <input :type="passwordFieldType" id="password" v-model="password" placeholder="**********">
        <button type="submit">Log in</button>
        <button class="outline" @click="state = 'singup'">Sing up</button>
      </form>
      <form @submit.prevent="Singup" v-if="state === 'singup'">
        <label for="email">Email</label>
        <input type="text" id="email" v-model="email2" placeholder="elon@musk.io" autocomplete="off">

        <label for="password">Password</label>&nbsp;
        <i class="fas" :class="[passwordFieldIcon]" @click="hidePassword2 = !hidePassword2"></i>
        <input :type="passwordFieldType" id="password" v-model="password2" placeholder="**********">
        <button type="submit">Sing up</button>
        <button class="outline" @click="state = 'login'">Log in</button>
      </form>
      <button class="outline" @click="loginInWithGoogle">Google</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'vue-router' // import router
import { toast } from 'vue3-toastify' // import toast
import { useFlowStore } from '@/stores/flow';
const flowStore = useFlowStore()

const email = ref("");
const password = ref("");
const hidePassword = ref(true);

const email2 = ref("");
const password2 = ref("");
const hidePassword2 = ref(true);

const passwordFieldIcon = computed(() => hidePassword.value ? "fa-eye" : "fa-eye-slash");
const passwordFieldType = computed(() => hidePassword.value ? "password" : "text");
const router = useRouter()

const state = ref('login')

const Login = async () => { // we also renamed this method 
  await signInWithEmailAndPassword(getAuth(), email.value, password.value) // THIS LINE CHANGED
    .then((data) => {
      toast("Successfully logged in!", { type: 'success' });
      flowStore.user = data.user
      router.push('/')
    })
    .catch(error => {
      switch (error.code) {
        case 'auth/invalid-email':
          toast("Invalid email", { type: 'error' });
          break
        case 'auth/user-not-found':
          toast("No account with that email was found", { type: 'error' });
          break
        case 'auth/wrong-password':
          toast("Incorrect password", { type: 'error' });
          break
        default:
          toast("Email or password was incorrect", { type: 'error' });
          break
      }
    });
}

const Singup = async () => {
  await createUserWithEmailAndPassword(getAuth(), email2.value, password2.value) // THIS LINE CHANGED
    .then((data) => {
      toast("Successfully logged in!", { type: 'success' });
      flowStore.user = data.user
      router.push('/')
    })
    .catch(error => {
      switch (error.code) {
        case 'auth/invalid-email':
          toast("Invalid email", { type: 'error' });
          break
        case 'auth/user-not-found':
          toast("No account with that email was found", { type: 'error' });
          break
        case 'auth/wrong-password':
          toast("Incorrect password", { type: 'error' });
          break
        default:
          toast("Email or password was incorrect", { type: 'error' });
          break
      }
    });
}

const loginInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()

  try {
    const result = await signInWithPopup(getAuth(), provider)
    if (result.user) {
      toast("Successfully logged in!", { type: 'success' });
      flowStore.user = result.user
      router.push('/')
    }
  } catch (error) {
    toast(`Something went wrong ${error}`, { type: 'error' });
  }
}

</script>

<style scoped lang="scss">
div#login {
  align-items: center;
  background-color: #e2e2e5;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
}

div#login div#description {
  background-color: #ffffff;
  width: 280px;
  padding: 35px;
}

div#login div#description h1,
div#login div#description p {
  margin: 0;
}

div#login div#description p {
  font-size: 0.8em;
  color: #95a5a6;
  margin-top: 10px;
}

div#login div#form {
  background-color: #34495e;
  border-radius: 5px;
  box-shadow: 0px 0px 30px 0px #666;
  color: #ecf0f1;
  width: 260px;
  padding: 35px;
}

div#login div#form label,
div#login div#form input {
  outline: none;
  width: 100%;
}

div#login div#form label {
  color: #95a5a6;
  font-size: 0.8em;
}

div#login div#form input {
  background-color: transparent;
  border: none;
  color: #ecf0f1;
  font-size: 1em;
  margin-bottom: 20px;
}

div#login div#form ::placeholder {
  color: #ecf0f1;
  opacity: 1;
}

div#login div#form button {
  background-color: #ffffff;
  cursor: pointer;
  border: none;
  padding: 10px;
  transition: 0.2s ease-in-out;
  width: 100%;

  &.outline {
    border: 1px solid #fff;
    background: transparent;
    margin-top: 16px;
    color: #fff;

    &:hover {
      color: #fff;
      background: transparent;
      box-shadow: inset 0 0 0 4px #fff;
    }
  }
}

div#login div#form button:hover {
  background-color: #eeeeee;
}

@media screen and (max-width: 600px) {
  div#login {
    align-items: unset;
    background-color: unset;
    display: unset;
    justify-content: unset;
  }

  div#login div#description {
    margin: 0 auto;
    max-width: 350px;
    width: 100%;
  }

  div#login div#form {
    border-radius: unset;
    box-shadow: unset;
    width: 100%;
  }

  div#login div#form form {
    margin: 0 auto;
    max-width: 280px;
    width: 100%;
  }
}
</style>