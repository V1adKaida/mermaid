import { createRouter, createWebHashHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import HomeView from '../views/HomeView.vue'
import Auth from '../views/Auth.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/auth',
      name: 'auth',
      component: Auth,
    }
  ]
})

router.beforeEach(async (to) => {
  // routes with `meta: { requiresAuth: true }` will check for the users, others won't
  if (to.meta.requiresAuth) {
    const currentUser = await getCurrentUser()
    // if the user is not logged in, redirect to the login page
    if (!currentUser) {
      return {
        path: '/auth',
        query: {
          redirect: to.fullPath,
        },
      }
    }
  }
})


export default router
