<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import api from "@/api/axios";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

// fallback zaštita
if (!auth.isAdmin) {
  router.push("/");
}

// state
const users = ref([]);
const page = ref(Number(route.query.page) || 0);
const size = ref(Number(route.query.size) || 5);
const totalPages = ref(0);

// dropdown state (po user ID)
const openMenuId = ref(null);

// fetch users
async function loadUsers() {
  try {
    const res = await api.get("/admin/users", {
      params: {
        page: page.value,
        size: size.value,
        sort: "username,asc",
      },
    });

    users.value = res.data.content;
    totalPages.value = res.data.totalPages;
  } catch (e) {
    console.error("Failed to load users", e);
  }
}

// pagination
function goToPage(p) {
  if (p < 0 || p >= totalPages.value) return;

  page.value = p;
  router.push({
    path: "/admin/users",
    query: { page: p, size: size.value },
  });
}

// actions
async function blockUser(id) {
  await api.put(`/admin/users/${id}/block`);
  openMenuId.value = null;
  await loadUsers(); // refresh
}

async function unblockUser(id) {
  await api.put(`/admin/users/${id}/unblock`);
  openMenuId.value = null;
  await loadUsers(); // refresh
}

// watch URL
watch(() => route.query.page, loadUsers, { immediate: true });
</script>

<template>
  <div class="container mt-5">
    <h3 class="mb-3">Admin – Users</h3>

    <table class="table table-striped table-hover align-middle">
      <thead>
      <tr>
        <th style="width: 240px;">ID</th>
        <th>Username</th>
        <th>Full Name</th>

        <th>Email</th>
        <th>Role</th>
        <th>Status</th>
        <th style="width: 120px;">Actions</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="u in users" :key="u.id">
        <td
            style="font-family: monospace; font-size: 0.85rem;"
            class="text-muted"
        >
          {{ u.id }}
        </td>

        <td>{{ u.username }}</td>
        <td>{{ u.fullName }}</td>
        <td>{{ u.email }}</td>

        <td>
            <span
                class="badge"
                :class="u.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'"
            >
              {{ u.role }}
            </span>
        </td>

        <td>
            <span
                class="badge"
                :class="u.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'"
            >
              {{ u.status }}
            </span>
        </td>

        <!-- ACTIONS -->
        <td class="position-relative">
          <button
              class="btn btn-sm btn-outline-secondary"
              @click="openMenuId = openMenuId === u.id ? null : u.id"
          >
            Actions ▼
          </button>

          <div
              v-if="openMenuId === u.id"
              class="card position-absolute mt-2 p-2"
              style="z-index: 20; min-width: 140px;"
          >
            <button
                class="btn btn-sm btn-danger mb-1"
                @click="blockUser(u.id)"
                :disabled="u.status === 'BLOCKED'"
            >
              Block
            </button>

            <button
                class="btn btn-sm btn-success"
                @click="unblockUser(u.id)"
                :disabled="u.status === 'ACTIVE'"
            >
              Unblock
            </button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <nav class="mt-3">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: page === 0 }">
          <button class="page-link" @click="goToPage(page - 1)">
            Previous
          </button>
        </li>

        <li
            v-for="p in totalPages"
            :key="p"
            class="page-item"
            :class="{ active: p - 1 === page }"
        >
          <button class="page-link" @click="goToPage(p - 1)">
            {{ p }}
          </button>
        </li>

        <li class="page-item" :class="{ disabled: page === totalPages - 1 }">
          <button class="page-link" @click="goToPage(page + 1)">
            Next
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>
