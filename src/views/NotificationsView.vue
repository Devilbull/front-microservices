<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { notifApi } from "@/api/axios";

const notifications = ref([]);
const loading = ref(true);
const error = ref(null);

// pagination state
const page = ref(0);
const size = ref(4);
const totalPages = ref(0);

const fetchNotifications = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await notifApi.get("/notifications/my", {
      params: {
        page: page.value,
        size: size.value,
      },
    });

    notifications.value = res.data.content;
    totalPages.value = res.data.totalPages;
  } catch (e) {
    error.value = "Failed to load notifications";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchNotifications);
watch(page, fetchNotifications);

// computed za smart pagination
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


</script>

<template>
  <div class="container mt-4">
    <h2>My Notifications</h2>

    <div v-if="loading" class="text-muted">
      Loading notifications...
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="!loading && notifications.length === 0" class="alert alert-info">
      No notifications yet.
    </div>

    <!-- LISTA -->
    <div v-for="n in notifications" :key="n.id" class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">{{ n.subject }}</h5>
        <p class="card-text" style="white-space: pre-line;">
          {{ n.message }}
        </p>
        <small class="text-muted">
          {{ new Date(n.sentAt).toLocaleString() }}
        </small>
        <br>
        <!-- Email bold -->
        To:
        <small class="text-muted fw-bold"> {{ n.email }}</small>
      </div>
    </div>

    <!-- PAGINATION -->
    <nav v-if="totalPages > 1" class="mt-4">
      <ul class="pagination justify-content-center">

        <!-- Previous -->
        <li class="page-item" :class="{ disabled: page === 0 }">
          <button class="page-link" @click="page--" :disabled="page === 0">
            Previous
          </button>
        </li>

        <!-- Smart page numbers -->
        <li
            v-for="p in pagesToShow"
            :key="p"
            class="page-item"
            :class="{ active: page + 1 === p, disabled: p === '...' }"
        >
          <button
              v-if="p !== '...'"
              class="page-link"
              @click="page = p - 1"
          >
            {{ p }}
          </button>
          <span v-else class="page-link">...</span>
        </li>

        <!-- Next -->
        <li class="page-item" :class="{ disabled: page === totalPages - 1 }">
          <button
              class="page-link"
              @click="page++"
              :disabled="page === totalPages - 1"
          >
            Next
          </button>
        </li>

      </ul>
    </nav>
  </div>
</template>
