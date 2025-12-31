import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
    {path: "/", redirect: "/profile"},
    {path: "/login", component: () => import("@/views/Login.vue")},
    {path: "/register", component: () => import("@/views/Register.vue")},
    {
        path: "/profile",
        component: () => import("@/views/Profile.vue"),
        meta: {requiresAuth: true},
    },
    {path: "/forgot-password", component: () => import("@/views/ForgotPassword.vue")},


    {path: "/password-reset", component: () => import("@/views/PasswordReset.vue")},
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: () => import("@/views/NotFound.vue"),
    },
    {
        path: "/admin/users",
        component: () => import("@/views/AdminUsers.vue"),
        meta: { requiresAuth: true, role: "ADMIN" },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to) => {
    const auth = useAuthStore();

    if (!auth.isAuthResolved) {
        await auth.resolveAuth();
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return "/login";
    }
});

export default router;
