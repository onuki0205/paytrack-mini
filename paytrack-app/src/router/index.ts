import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth';


const LandingView = () => import('@/views/LandingView.vue');
const DashboardView = () => import('@/views/DashboardView.vue');
const LoanCreateView = () => import('@/views/LoanCreateView.vue');
const SignupView = () => import('@/views/SignupView.vue');

const routes = [
    { path: '/', name: 'Landing', component: LandingView },
    {
      path: '/dashboard/',
      name: 'Dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
      props: false,
    },
    {
      path: '/loan/new',
      name: 'LoanCreate',
      component: LoanCreateView,
      meta: { requiresAuth: true },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: SignupView,
      meta: { requiresAuth: true },
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