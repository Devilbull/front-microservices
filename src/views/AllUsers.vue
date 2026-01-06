<script setup>
import { ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import userApi from "@/api/axios";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

// fallback zaštita
if (!auth.isAuthenticated) {
  router.push("/login");
}

// search state
const search = ref(route.query.username || "");

// users state
const users = ref([]);
const page = ref(Number(route.query.page) || 0);
const size = ref(Number(route.query.size) || 5);
const totalPages = ref(0);

// dropdown state (po user ID)
const openMenuId = ref(null);

// INVITE MODAL state
const showInviteModal = ref(false);
const inviteTargetUser = ref(null);
const mySessions = ref([]);
const invitePage = ref(0);
const inviteSize = ref(5);
const inviteTotalPages = ref(0);

// fetch users
async function loadUsers() {
  try {
    const res = await userApi.get("/users", {
      params: {
        page: page.value,
        size: size.value,
        sort: "username,asc",
        username: search.value || undefined,
      },
      withCredentials: true
    });

    users.value = res.data.content;
    totalPages.value = res.data.totalPages;
  } catch (e) {
    console.error("Failed to load users", e);
  }
}

// pagination
function goToPage(p) {
  if (p < 0) return;

  page.value = p;
  const query = {
    page: p,
    size: size.value,
  };

  if (search.value && search.value.trim() !== "") {
    query.username = search.value.trim();
  }

  router.push({ path: "/users", query });
}

// actions
async function blockUser(id) {
  await userApi.put(`/admin/users/${id}/block`);
  openMenuId.value = null;
  await loadUsers();
}

async function unblockUser(id) {
  await userApi.put(`/admin/users/${id}/unblock`);
  openMenuId.value = null;
  await loadUsers();
}

// Invite logic
function openInviteModal(user) {
  inviteTargetUser.value = user;
  invitePage.value = 0;
  showInviteModal.value = true;
  loadMySessions();
}

function closeInviteModal() {
  showInviteModal.value = false;
  inviteTargetUser.value = null;
  mySessions.value = [];
}

import {gameApi} from "@/api/axios";

// load sessions created by current owner
async function loadMySessions() {
  try {
    const res = await gameApi.get("/sessions/my", {
      params: {
        page: invitePage.value,
        size: inviteSize.value,
        sort: "startOfSession,desc",
        excludedUserId: inviteTargetUser.value?.id  // <--- Ovdje šaljemo target user
      },
      withCredentials: true
    });
    mySessions.value = res.data.content;
    inviteTotalPages.value = res.data.totalPages;
  } catch (e) {
    console.error("Failed to load sessions", e);
  }
}

async function inviteUserToSession(sessionId) {
  if (!inviteTargetUser.value) return;

  try {
    await gameApi.post("/sessions/call-to-session", {
      sessionId,
      invitedUserId: inviteTargetUser.value.id
    }, { withCredentials: true });


    alert(`User ${inviteTargetUser.value.username} invited successfully!`);
    closeInviteModal();
  } catch (e) {
    console.error(e);
    alert("Failed to send invitation");
  }
}

// watch URL
watch(
    () => [route.query.page, route.query.username, route.query.size],
    loadUsers,
    { immediate: true }
);

watch(() => route.query.username, (newUsername) => {
  search.value = newUsername || "";
});

watch(() => search.value, () => {
  page.value = 0;
});

// pagination logic
const pagesToShow = computed(() => {
  const current = page.value + 1; // 1-based
  const pages = [];
  if (totalPages.value === 0) return pages;

  pages.push(1);
  if (current > 4) pages.push("...");

  for (let i = current - 2; i <= current + 2; i++) {
    if (i > 1 && i < totalPages.value) pages.push(i);
  }

  if (current + 2 < totalPages.value - 1) pages.push("...");
  if (totalPages.value > 1) pages.push(totalPages.value);

  return pages;
});
</script>
<template>
  <div class="container mt-5">
    <h3 class="mb-3">All Users</h3>

    <div class="mb-3 d-flex gap-2" style="max-width: 420px;">
      <input
          class="form-control"
          placeholder="Search by username..."
          v-model="search"
          @keyup.enter="goToPage(0)"
      />
      <button class="btn btn-primary" @click="goToPage(0)">Search</button>
    </div>

    <table class="table table-striped table-hover align-middle">
      <thead>
      <tr>
        <th style="width: 240px;">ID</th>
        <th>Username</th>
        <th>Full Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Status</th>
        <th style="width: 140px;">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="u in users" :key="u.id">
        <td style="font-family: monospace; font-size: 0.85rem;" class="text-muted">
          {{ u.id }}
        </td>
        <td>{{ u.username }}</td>
        <td>{{ u.fullName }}</td>
        <td>{{ u.email }}</td>
        <td>
          <span :class="['badge', u.role === 'ADMIN' ? 'bg-danger' : 'bg-primary']">{{ u.role }}</span>
        </td>
        <td>
          <span :class="['badge', u.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary']">{{ u.status }}</span>
        </td>
        <td class="position-relative">
          <!-- ADMIN actions -->
          <div v-if="auth.isAdmin && u.role !== 'ADMIN'">
            <button class="btn btn-sm btn-outline-secondary" @click="openMenuId = openMenuId === u.id ? null : u.id">
              Actions ▼
            </button>
            <div v-if="openMenuId === u.id" class="card position-absolute mt-2 p-2" style="z-index: 20; min-width: 140px;">
              <button class="btn btn-sm btn-danger mb-1" @click="blockUser(u.id)" :disabled="u.status === 'BLOCKED'">Block</button>
              <button class="btn btn-sm btn-success" @click="unblockUser(u.id)" :disabled="u.status === 'ACTIVE'">Unblock</button>
            </div>
          </div>

          <!-- OWNER invite action -->
          <div v-else-if="!auth.isAdmin && u.role !== 'ADMIN' && u.id !== auth.user.id && u.status === 'ACTIVE'">
            <button class="btn btn-sm btn-outline-primary" @click="openInviteModal(u)">Invite ▼</button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <nav class="mt-3">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: page === 0 }">
          <button class="page-link" @click="goToPage(page - 1)">Previous</button>
        </li>

        <li v-for="p in pagesToShow" :key="p" class="page-item" :class="{ active: page + 1 === p, disabled: p === '...' }">
          <button v-if="p !== '...'" class="page-link" @click="goToPage(p - 1)">{{ p }}</button>
          <span v-else class="page-link">...</span>
        </li>

        <li class="page-item" :class="{ disabled: page === totalPages - 1 }">
          <button class="page-link" @click="goToPage(page + 1)">Next</button>
        </li>
      </ul>
    </nav>

    <!-- Invite Modal -->
    <div v-if="showInviteModal" class="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-content p-3">
          <h5>Invite {{ inviteTargetUser.username }} to a session</h5>

          <table class="table table-sm mt-2">
            <thead>
            <tr>
              <th>Session Name</th>
              <th>Game</th>
              <th>Start</th>
              <th>Action</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="s in mySessions" :key="s.sessionId">
              <td>{{ s.sessionName }}</td>
              <td>{{ s.gameName }}</td>
              <td>{{ new Date(s.startTime).toLocaleString() }}</td>
              <td>
                <button class="btn btn-sm btn-success" @click="inviteUserToSession(s.sessionId)">Invite</button>
              </td>
            </tr>
            </tbody>
          </table>

          <!-- pagination -->
          <nav class="mt-2">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: invitePage === 0 }">
                <button class="page-link" @click="invitePage--; loadMySessions()">Previous</button>
              </li>
              <li class="page-item disabled">
                <span class="page-link">{{ invitePage + 1 }} / {{ inviteTotalPages }}</span>
              </li>
              <li class="page-item" :class="{ disabled: invitePage === inviteTotalPages - 1 }">
                <button class="page-link" @click="invitePage++; loadMySessions()">Next</button>
              </li>
            </ul>
          </nav>

          <button class="btn btn-secondary mt-2" @click="closeInviteModal()">Close</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-dialog {
  background: white;
  border-radius: 0.3rem;
  max-width: 600px;
  width: 100%;
}
</style>
