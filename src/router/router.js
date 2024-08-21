import { createRouter, createWebHistory } from "vue-router";
import Auth from "../views/AuthView.vue";
import DocumentValidation from "../views/DocumentValidationView.vue";
import Profile from "../views/ProfileView.vue";
import Home from "../views/HomeView.vue";
import PrincipalView from "@/views/PrincipalView.vue";
import ExamFinished from "../views/ExamFinishedView.vue";
import Login from "@/views/LoginView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "/validacion-documento",
      component: DocumentValidation,
    },
    {
      path: "/perfil",
      name: "Profile",
      component: Profile,
    },
    {
      path: "/examen",
      name: "Home",
      component: PrincipalView,
    },
    {
      path: "/examen-finalizado",
      name: "ExamFinished",
      component: ExamFinished,
    },
    {
      path: "/login-admin",
      name: "Auth",
      component: Auth,
    },
  ],
});

export default router;
