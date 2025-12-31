import { defineStore } from "pinia";
import userApi from "@/api/axios";

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
                const res = await userApi.get("/users/me");
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
                await userApi.post("/auth/login", credentials);
                await this.resolveAuth();
                if (this.user?.status === "BLOCKED") {
                    this.logoutLocal();
                    throw new Error("Your account is blocked.");
                }
            } catch (err) {
                // uhvati poruku iz backend-a ili generiši default
                const msg = err.response?.data?.message || err.response?.data?.error || "Login failed. Try again.";
                throw new Error(msg);
            }
        },

        async logout() {
            await userApi.post("/auth/logout");
            this.logoutLocal();
        },

        logoutLocal() {
            this.user = null;
            this.isAuthenticated = false;
        },
        async forgotPassword(email) {
            try {
                await userApi.post("/auth/password-forget", { email });
            } catch (err) {
                throw err.response?.data?.message || "Something went wrong!";
            }
        },

        async resetPassword(token, newPassword) {
            try {
                await userApi.post("/auth/password-reset", { token, newPassword });
            } catch (err) {
                throw err.response?.data?.message || "Something went wrong!";
            }
        }
    },
});
