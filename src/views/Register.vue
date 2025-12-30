<script setup>
import { ref } from "vue";
import api from "@/api/axios";
import { useRouter } from "vue-router";

const router = useRouter();

const username = ref("");
const password = ref("");

async function submit() {
  await api.post("/auth/register", {
    username: username.value,
    password: password.value,
  });
  router.push("/login");
}
</script>

<template>
  <div class="container mt-5" style="max-width: 400px">
    <h3 class="mb-3">Register</h3>

    <input class="form-control mb-2" v-model="username" placeholder="Username" />
    <input
        class="form-control mb-3"
        type="password"
        v-model="password"
        placeholder="Password"
    />

    <button class="btn btn-success w-100" @click="submit">
      Register
    </button>
  </div>
</template>
