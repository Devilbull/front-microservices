<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { notifApi } from "@/api/axios";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

// fallback zaštita
if (!auth.isAdmin) {
  router.push("/");
}

// search po emailu
const search = ref(route.query.email || "");

// state
const notifications = ref([]);
const loading = ref(true);
const error = ref(null);

// pagination state
const page = ref(Number(route.query.page) || 0);
const size = ref(5);
const totalPages = ref(0);

// fetch notifications
const fetchNotifications = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await notifApi.get("/notifications/all", {
      params: {
        page: page.value,
        size: size.value,
        sort: "sentAt,desc",
        email: search.value || undefined,
      },
    });

    notifications.value = res.data.content;
    totalPages.value = res.data.totalPages;
  } catch (e) {
    console.error(e);
    error.value = "Failed to load notifications";
  } finally {
    loading.value = false;
  }
};

// Smart pagination
const pagesToShow = computed(() => {
  const current = page.value + 1; // 1-based
  const pages = [];

  if (totalPages.value === 0) return pages;

  // uvek prva strana
  pages.push(1);

  // "..." levo ako je potrebno
  if (current > 4) pages.push("...");

  // stranice oko trenutne: current-2, current-1, current, current+1, current+2
  for (let i = current - 2; i <= current + 2; i++) {
    if (i > 1 && i < totalPages.value) {
      pages.push(i);
    }
  }

  // "..." desno ako je potrebno
  if (current + 2 < totalPages.value - 1) pages.push("...");

  // poslednja strana, ako nije već dodana
  if (totalPages.value > 1) pages.push(totalPages.value);

  return pages;
});

// watchers
watch([page, search], fetchNotifications, { immediate: true });
watch(
    () => route.query.email,
    (newEmail) => {
      search.value = newEmail || "";
    }
);
</script>

<template>
  <div class="container mt-5">
    <h3 class="mb-3">Admin – Notifications</h3>

    <div class="mb-3 d-flex gap-2" style="max-width: 420px;">
      <input
          class="form-control"
          placeholder="Search by email..."
          v-model="search"
          @keyup.enter="page = 0"
      />
      <button class="btn btn-primary" @click="page = 0">
        Search
      </button>
    </div>

    <div v-if="loading" class="text-muted">Loading notifications...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="!loading && notifications.length === 0" class="alert alert-info">
      No notifications found.
    </div>

    <!-- LISTA NOTIFIKACIJA -->
    <div v-for="n in notifications" :key="n.id" class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">{{ n.subject }}</h5>
        <p class="card-text" style="white-space: pre-line;">{{ n.message }}</p>
        <small class="text-muted">{{ new Date(n.sentAt).toLocaleString() }}</small>
        <br />
        <!-- Email bold -->
        To:
        <small class="text-muted fw-bold">{{ n.email }}</small>
      </div>
    </div>

    <!-- PAGINATION -->
    <nav v-if="totalPages > 1" class="mt-4">
      <ul class="pagination justify-content-center">
        <!-- Previous -->
        <li class="page-item" :class="{ disabled: page === 0 }">
          <button class="page-link" @click="page--" :disabled="page === 0">Previous</button>
        </li>

        <!-- Smart page numbers -->
        <li
            v-for="p in pagesToShow"
            :key="p"
            class="page-item"
            :class="{ active: page + 1 === p, disabled: p === '...' }"
        >
          <button v-if="p !== '...'" class="page-link" @click="page = p - 1">{{ p }}</button>
          <span v-else class="page-link">...</span>
        </li>

        <!-- Next -->
        <li class="page-item" :class="{ disabled: page === totalPages - 1 }">
          <button class="page-link" @click="page++" :disabled="page === totalPages - 1">Next</button>
        </li>
      </ul>
    </nav>
  </div>
</template>
