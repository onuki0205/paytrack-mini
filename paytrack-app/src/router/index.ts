import { createRouter, createWebHistory } from 'vue-router'

const LandingView = () => import('@/views/LandingView.vue');
const DashboardView = () => import('@/views/DashboardView.vue');

const routes = [
    { path: '/', name: 'Landing', component: LandingView },
    {path: '/dashbourd', name: 'Dashbourd', component: DashboardView},
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;