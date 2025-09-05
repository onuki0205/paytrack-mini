import { createRouter, createWebHistory } from 'vue-router'

const DashboardView = () => import('@/views/DashboardView.vue');
const LoinView = () => import('@/views/LoginView.vue');

const routes = [
    { path: '/', name: 'Dashboard', component: DashboardView },
    {path: '/login', name: 'Login', component: LoinView},
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;