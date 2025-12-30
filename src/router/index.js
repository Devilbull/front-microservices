// javascript
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
    { path: "/", redirect: "/profile" },
    { path: "/login", component: () => import("@/views/Login.vue") },
    { path: "/register", component: () => import("@/views/Register.vue") },
    {
        path: "/profile",
        component: () => import("@/views/Profile.vue"),
        meta: { requiresAuth: true },
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