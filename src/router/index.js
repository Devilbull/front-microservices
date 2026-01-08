import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import NotificationsView from "@/views/NotificationsView.vue";
import SessionsView from "@/views/SessionsView.vue";
import CreateSessionView from "@/views/CreateSessionView.vue";

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
        path: "/users",
        component: () => import("@/views/AllUsers.vue"),
        meta: { requiresAuth: true },
    },
    {
        path: "/admin/notifications",
        name: "AdminNotifications",
        component: () => import("@/views/AdminNotifications.vue"),
        meta: { requiresAdmin: true }
    },
    {
        path: "/notifications",
        name: "Notifications",
        component: NotificationsView,
        meta: { requiresAuth: true },
    },
    {
        path: "/games",
        component: () => import("@/views/GamesView.vue"),
        meta: {requiresAuth: true},
    },
    {
        path: "/sessions",
        component: SessionsView,
        meta: {requiresAuth: true},
    },
    {
        path: "/sessions/create",
        component: CreateSessionView,
        meta: {requiresAuth: true},
    }
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
