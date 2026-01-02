<script setup>
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push("/login");
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <router-link class="navbar-brand" to="/">Gaming App</router-link>

      <ul class="navbar-nav ms-auto align-items-center">
        <li v-if="!auth.isAuthenticated" class="nav-item">
          <router-link class="nav-link" to="/login">Login</router-link>
        </li>

        <li v-if="!auth.isAuthenticated" class="nav-item">
          <router-link class="nav-link" to="/register">Register</router-link>
        </li>

        <li v-if="auth.isAuthenticated" class="nav-item">
          <router-link class="nav-link" to="/profile">My Profile</router-link>
        </li>
        <li v-if="auth.isAuthenticated" class="nav-item">
          <router-link class="nav-link" to="/notifications">
            Notifications
          </router-link>
        </li>

        <!-- ADMIN DROPDOWN -->
        <li
            v-if="auth.isAuthenticated && auth.isAdmin"
            class="nav-item dropdown"
        >
          <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
          >
            Admin
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <router-link
                  class="dropdown-item"
                  :to="{ path: '/admin/users', query: { page: 0, size: 5 } }"
              >
                Users
              </router-link>
            </li>
            <li>
              <router-link class="dropdown-item" :to="{ path: '/admin/notifications', query: { page: 0, size: 5 } }">
                Notifications
              </router-link>
            </li>
          </ul>
        </li>

        <li v-if="auth.isAuthenticated" class="nav-item ms-2">
          <button class="btn btn-outline-danger btn-sm" @click="logout">
            Logout
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>
