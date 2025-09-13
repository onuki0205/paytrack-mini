import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth';

const LandingView = () => import('@/views/LandingView.vue');
const DashboardView = () => import('@/views/DashboardView.vue');

const routes = [
    { path: '/', name: 'Landing', component: LandingView },
    {
      path: '/dashboard/:uid',
      name: 'Dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
      props: true,
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, _, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ name: 'Landing' })
  } else {
    next()
  }
})

export default router;