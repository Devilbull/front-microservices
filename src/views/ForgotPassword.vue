<script setup>
import { ref } from "vue";

import { useRouter } from "vue-router";

const email = ref("");
const router = useRouter();
const message = ref("");

import { useAuthStore } from "@/stores/auth";
const auth = useAuthStore();

async function submit() {
  try {
    await auth.forgotPassword(email.value);
    message.value = "Email with token sent successfully!";
    setTimeout(() => router.push("/password-reset"), 2000);
  } catch (err) {
    message.value = "Invalid email or error sending email.";
  }
}
</script>

<template>
  <div class="container mt-5" style="max-width: 400px">
    <h3 class="mb-3">Forgot Password</h3>

    <input
        class="form-control mb-3"
        type="email"
        v-model="email"
        placeholder="Enter your email"
    />

    <button class="btn btn-primary w-100" @click="submit">
      Send Reset Email
    </button>

    <p class="mt-2 text-success" v-if="message">{{ message }}</p>
  </div>
</template>
