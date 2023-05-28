import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { basicSetup } from 'codemirror'
import VueCodemirror from 'vue-codemirror'
import Vue3Toasity, { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { VueFire, VueFireAuth } from 'vuefire'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)

const firebaseConfig = {
  apiKey: "AIzaSyA8HX4muv5mNgGgQSOoXwUQ80BaVQ7woSE",
  authDomain: "mermeid-316df.firebaseapp.com",
  projectId: "mermeid-316df",
  storageBucket: "mermeid-316df.appspot.com",
  messagingSenderId: "778367453854",
  appId: "1:778367453854:web:2d5e4990ceea083e1dc98f",
  measurementId: "G-13QDXNHTHG",
  databaseURL: "https://mermeid-316df-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

app.use(VueFire, {
  firebaseApp,
  modules: [
    VueFireAuth(),
  ],
})

const pinia = createPinia();
app.use(pinia)
pinia.use(piniaPluginPersistedstate);
app.use(VueCodemirror, {
  autofocus: true,
  disabled: false,
  indentWithTab: true,
  tabSize: 2,
  placeholder: 'Code goes here...',
  extensions: [basicSetup]
})
app.use(Vue3Toasity, {
  autoClose: 3000,
  position: toast.POSITION.TOP_RIGHT,
})

app.use(router)

app.mount('#app')
