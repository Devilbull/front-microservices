import { defineStore } from "pinia";
import api from "@/api/axios";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        isAuthenticated: false,
        isAuthResolved: false,
    }),

    actions: {
        async resolveAuth() {
            try {
                const res = await api.get("/users/me");
                this.user = res.data;
                this.isAuthenticated = true;
            } catch (e) {
                this.user = null;
                this.isAuthenticated = false;
            } finally {
                this.isAuthResolved = true;
            }
        },

        async login(credentials) {
            await api.post("/auth/login", credentials);
            await this.resolveAuth();
        },

        async logout() {
            await api.post("/auth/logout");
            this.logoutLocal();
        },

        logoutLocal() {
            this.user = null;
            this.isAuthenticated = false;
        },
    },
});
