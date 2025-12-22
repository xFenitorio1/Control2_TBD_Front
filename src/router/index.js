import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/',
      redirect: '/dashboard',
      component: () => import('../components/AppLayout.vue'),
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        {
          path: '/tasks',
          name: 'tasks',
          component: () => import('../views/TasksView.vue')
        },
        {
          path: '/stats',
          name: 'stats',
          component: () => import('../views/StatsView.vue')
        }
      ]
    }
  ]
})

export default router
