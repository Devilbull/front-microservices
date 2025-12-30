<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();

onMounted(async () => {
  await auth.resolveAuth();

  // Ako je korisnik logovan, preusmeri na /profile
  if (auth.isAuthenticated) {
    router.replace("/profile");
  }
});
</script>

<template>
  <router-view />
</template>
