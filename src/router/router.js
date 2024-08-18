import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../views/AuthView.vue'
import DocumentValidation from '../views/DocumentValidationView.vue'
import Profile from '../views/ProfileView.vue'
import Home from '../views/HomeView.vue'
import ExamFinished from '../views/ExamFinishedView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Auth',
            component: Auth
        },
        {
            path: '/validacion-documento',
            name: 'DocumentValidation',
            component: DocumentValidation
        },
        {
            path: '/perfil',
            name: 'Profile',
            component: Profile
        },
        {
            path: '/examen',
            name: 'Home',
            component: Home
        },
        {
            path: '/examen-finalizado',
            name: 'ExamFinished',
            component: ExamFinished
        }
    ]
})

export default router
