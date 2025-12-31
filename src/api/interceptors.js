import userApi from "./axios";
import { useAuthStore } from "@/stores/auth";

export function setupInterceptors() {
    userApi.interceptors.response.use(
        response => response,
        error => {
            if (error.response && error.response.status === 401) {
                const auth = useAuthStore();
                auth.logoutLocal();
            }
            return Promise.reject(error);
        }
    );
}
