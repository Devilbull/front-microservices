<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import Navbar from "@/components/Navbar.vue";

const auth = useAuthStore();
const router = useRouter();

onMounted(async () => {
  await auth.resolveAuth();

  // Ako je korisnik logovan i na login page, preusmeri na profile
  if (auth.isAuthenticated && router.currentRoute.value.path === "/login") {
    await router.replace("/profile");
  }
});
</script>

<template>
  <Navbar />
  <router-view />
</template>
