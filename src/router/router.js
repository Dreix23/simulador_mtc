import { createRouter, createWebHistory } from "vue-router";
import { authService } from "../services/auth_service";
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
      name: "validacion-documento",
      component: DocumentValidation,
    },
    {
      path: "/perfil",
      name: "Profile",
      component: Profile,
      meta: { requiresValidation: true }
    },
    {
      path: "/examen",
      name: "Home",
      component: Home,
      meta: { requiresValidation: true }
    },
    {
      path: "/examen-finalizado",
      name: "ExamFinished",
      component: ExamFinished,
      meta: { requiresValidation: true }
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
      meta: { requiresAuth: true }
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const user = await authService.getCurrentUser();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresValidation = to.matched.some(record => record.meta.requiresValidation);
  const userDataValidated = localStorage.getItem('userData') !== null;

  if (requiresAuth && !user) {
    next({ name: "Auth" });
  } else if (to.name === "Auth" && user) {
    next({ name: "Admin" });
  } else if (requiresValidation && !userDataValidated) {
    next({ name: "validacion-documento" });
  } else {
    next();
  }
});

export default router;
