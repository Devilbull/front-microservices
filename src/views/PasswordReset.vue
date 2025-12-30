<script setup>
import { ref } from "vue";

import { useRouter } from "vue-router";

const token = ref("");
const newPassword = ref("");
const message = ref("");
const router = useRouter();

import { useAuthStore } from "@/stores/auth";
const auth = useAuthStore();

async function submit() {
  try {
    await auth.resetPassword(token.value, newPassword.value);
    message.value = "Password reset successfully!";
    setTimeout(() => router.push("/login"), 2000);
  } catch (err) {
    message.value = "Invalid token or error resetting password.";
  }
}
</script>

<template>
  <div class="container mt-5" style="max-width: 400px">
    <h3 class="mb-3">Reset Password</h3>

    <input
        class="form-control mb-2"
        v-model="token"
        placeholder="Enter your token"
    />
    <input
        class="form-control mb-3"
        type="password"
        v-model="newPassword"
        placeholder="Enter new password"
    />

    <button class="btn btn-primary w-100" @click="submit">
      Reset Password
    </button>

    <p class="mt-2 text-success" v-if="message">{{ message }}</p>
  </div>
</template>
