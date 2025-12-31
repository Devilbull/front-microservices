<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const username = ref("");
const password = ref("");
const errorMessage = ref("");

async function submit() {
  errorMessage.value = "";
  try {
    await auth.login({
      username: username.value,
      password: password.value,
    });
    await router.push("/profile");
  } catch (err) {
    errorMessage.value = err.message;
  }
}
</script>

<template>
  <div class="container mt-5" style="max-width: 400px">
    <!-- Error message -->
    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
    <h3 class="mb-3">Login</h3>

    <input class="form-control mb-2" v-model="username" placeholder="Username" />
    <input
        class="form-control mb-3"
        type="password"
        v-model="password"
        placeholder="Password"
    />

    <button class="btn btn-primary w-100 mb-2" @click="submit">
      Login
    </button>

    <!-- Link za forgot password -->
    <div class="text-center">
      <router-link to="/forgot-password">Forgot Password?</router-link>
    </div>
  </div>
</template>
