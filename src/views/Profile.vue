<script setup>
import { useAuthStore } from "@/stores/auth";
import router from "@/router/index.js";

const auth = useAuthStore();

async function submit() {
  await auth.logout()
  await router.push("/login");
}
</script>

<template>
  <div class="container mt-5">
    <div class="card">
      <div class="card-body">
        <h4>Profile</h4>

        <p v-if="auth.user">
          <strong>User:</strong> {{ auth.user.username }} <br />
          <strong>Role:</strong> {{ auth.user.role }}
        </p>

        <button class="btn btn-danger" @click="submit">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>
