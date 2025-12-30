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
      <a class="navbar-brand" href="#">Gaming App</a>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">
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
            <button class="btn btn-outline-danger" @click="logout">Logout</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
