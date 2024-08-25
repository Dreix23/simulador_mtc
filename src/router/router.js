import { createRouter, createWebHistory } from "vue-router";
import DocumentValidation from "../views/DocumentValidationView.vue";
import Profile from "../views/ProfileView.vue";
import Home from "../views/HomeView.vue";
import ExamFinished from "../views/ExamFinishedView.vue";
import Login from "@/views/LoginView.vue";
import AdminView from "@/views/AdminView.vue";

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
      component: Home,
    },
    {
      path: "/examen-finalizado",
      name: "ExamFinished",
      component: ExamFinished,
    },
    {
      path: "/login-admin",
      name: "Auth",
      component: Login,
    },
    {
      path: "/admin",
      name: "Admin",
      component: AdminView,
    },
  ],
});

export default router;
