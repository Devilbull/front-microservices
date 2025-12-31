import { defineStore } from "pinia";
import api from "@/api/axios";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        isAuthenticated: false,
        isAuthResolved: false,
    }),

    getters: {
        isAdmin: (state) => state.user?.role === "ADMIN",
        isGamer: (state) => state.user?.role === "GAMER",
    },

    actions: {
        async resolveAuth() {
            try {
                const res = await api.get("/users/me");
                this.user = res.data;
                this.isAuthenticated = true;
                if (this.user.status === "BLOCKED") {
                    this.logoutLocal();
                    return;
                }
            } catch (e) {
                this.user = null;
                this.isAuthenticated = false;
            } finally {
                this.isAuthResolved = true;
            }
        },

        async login(credentials) {
            try {
                await api.post("/auth/login", credentials);
                await this.resolveAuth();
            } catch (err) {
                if (err.response) {
                    console.log(err.response.data); // ovde će biti tvoj JSON
                }
            }

        },

        async logout() {
            await api.post("/auth/logout");
            this.logoutLocal();
        },

        logoutLocal() {
            this.user = null;
            this.isAuthenticated = false;
        },
        async forgotPassword(email) {
            try {
                await api.post("/auth/password-forget", { email });
            } catch (err) {
                throw err.response?.data?.message || "Something went wrong!";
            }
        },

        async resetPassword(token, newPassword) {
            try {
                await api.post("/auth/password-reset", { token, newPassword });
            } catch (err) {
                throw err.response?.data?.message || "Something went wrong!";
            }
        }
    },
});
