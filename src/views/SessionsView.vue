<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { gameApi } from "@/api/axios";
import { useAuthStore } from "@/stores/auth";

/* CORE */
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

/* FILTERS */
const searchKeywords = ref(route.query.keywords || "");
const searchGame = ref(route.query.gameName || "");
const searchSessionType = ref(route.query.sessionType || "");
const searchMaxPlayers = ref(route.query.maxPlayers || "");
const searchIsJoined = ref(route.query.isJoined || ""); // "" | "true" | "false"
const onlyMySessions = ref(route.query.onlyMy || false);

/* SORT */
const sort = ref(route.query.sort || "startOfSession,desc");

/* PAGINATION */
const page = ref(Number(route.query.page) || 0);
const size = ref(Number(route.query.size) || 5);
const totalPages = ref(0);

/* DATA */
const sessions = ref([]);

/* UI */
const openMenuId = ref(null);
const lockEmails = ref({});
const showLockInputFor = ref(null);

/* LOAD */
async function loadSessions() {
  const params = {
    page: page.value,
    size: size.value,
    sort: sort.value,
    sessionName: searchKeywords.value || undefined,
    gameName: searchGame.value || undefined,
    sessionType: searchSessionType.value || undefined,
    maxNumPlayers: searchMaxPlayers.value || undefined,
    isJoined: searchIsJoined.value ? searchIsJoined.value === "true" : undefined,
  };

  // ako je onlyMySessions, pozovi /my endpoint
  const endpoint = onlyMySessions.value ? "/sessions/my" : "/sessions/all";

  const res = await gameApi.get(endpoint, { params });
  sessions.value = res.data.content;
  totalPages.value = res.data.totalPages;
}

/* ACTIONS */
async function cancelSession(id) {
  await gameApi.post(`/sessions/${id}/cancel`);
  openMenuId.value = null;
  loadSessions();
}

async function lockSession(id) {
  const emails = (lockEmails.value[id] || "")
      .split(",")
      .map(e => e.trim())
      .filter(Boolean);

  await gameApi.post("/sessions/lock-session", { sessionId: id, emails });

  openMenuId.value = null;
  showLockInputFor.value = null;
  lockEmails.value[id] = "";
  loadSessions();
}

/* PAGINATION */
function goToPage(p) {
  if (p < 0 || p >= totalPages.value) return;
  page.value = p;
  updateQuery();
}

/* UPDATE QUERY */
function updateQuery() {
  router.push({
    query: {
      page: page.value,
      size: size.value,
      sort: sort.value,
      sessionName: searchKeywords.value || undefined,
      gameName: searchGame.value || undefined,
      sessionType: searchSessionType.value || undefined,
      maxPlayers: searchMaxPlayers.value || undefined,
      isJoined: searchIsJoined.value || undefined,
      onlyMy: onlyMySessions.value || undefined
    }
  });
}

/* PAGE NUMBERS */
const pagesToShow = computed(() => {
  const current = page.value + 1;
  const pages = [];
  if (!totalPages.value) return pages;

  pages.push(1);
  if (current > 4) pages.push("...");
  for (let i = current - 2; i <= current + 2; i++) {
    if (i > 1 && i < totalPages.value) pages.push(i);
  }
  if (current + 2 < totalPages.value - 1) pages.push("...");
  pages.push(totalPages.value);

  return [...new Set(pages)];
});

/* DEBOUNCE */
function debounce(fn, delay = 400) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

/* AUTO RELOAD */
const autoReload = debounce(() => {
  page.value = 0;
  updateQuery();
}, 400);

watch(
    [searchKeywords, searchGame, searchSessionType, searchMaxPlayers, searchIsJoined, onlyMySessions, sort],
    autoReload
);
watch(() => route.query, loadSessions, { immediate: true });
</script>

<template>
  <div class="container mt-5">
    <h3>Sessions</h3>

    <!-- FILTERS -->
    <div class="row mb-3 g-2">
      <div class="col-md-2">
        <input class="form-control" placeholder="Session name" v-model="searchKeywords"/>
      </div>
      <div class="col-md-2">
        <input class="form-control" placeholder="Game name" v-model="searchGame"/>
      </div>
      <div class="col-md-2">
        <select class="form-select" v-model="searchSessionType">
          <option value="">All types</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
      <div class="col-md-2">
        <input type="number" min="1" class="form-control" placeholder="Max players" v-model="searchMaxPlayers"/>
      </div>
      <div class="col-md-2">
        <select class="form-select" v-model="searchIsJoined">
          <option value="">All</option>
          <option value="true">Joined</option>
          <option value="false">Not joined</option>
        </select>
      </div>
      <div class="col-md-2 d-flex align-items-center">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="onlyMySessions" v-model="onlyMySessions">
          <label class="form-check-label" for="onlyMySessions">
            Only My Sessions
          </label>
        </div>
      </div>
      <div class="col-md-2 mt-2">
        <select class="form-select" v-model="sort">
          <option value="startOfSession,desc">Start ↓</option>
          <option value="startOfSession,asc">Start ↑</option>
          <option value="maxPlayers,desc">Players ↓</option>
          <option value="maxPlayers,asc">Players ↑</option>
        </select>
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-responsive">
      <table class="table table-striped table-hover align-middle">
        <thead>
        <tr>
          <th>Name</th>
          <th>Game</th>
          <th>Owner</th>
          <th>Players</th>
          <th>Start</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="s in sessions" :key="s.sessionId">
          <td>{{ s.sessionName }}</td>
          <td>{{ s.gameName }}</td>
          <td>
              <span :class="['badge', auth.user?.id === s.creatorId ? 'bg-primary' : 'bg-secondary']">
                {{ auth.user?.id === s.creatorId ? "Me" : "Other" }}
              </span>
          </td>
          <td>{{ s.currentPlayers }}/{{ s.maxPlayers }}</td>
          <td>{{ new Date(s.startTime).toLocaleString() }}</td>
          <td>
              <span :class="{
                'badge bg-success': s.sessionStatus === 'SCHEDULED',
                'badge bg-secondary': s.sessionStatus === 'FINISHED',
                'badge bg-danger': s.sessionStatus === 'CANCELLED'
              }">{{ s.sessionStatus }}</span>
          </td>
          <td class="position-relative" style="min-width: 220px;">
            <div v-if="auth.user?.id === s.creatorId && s.sessionStatus === 'SCHEDULED'">
              <button class="btn btn-sm btn-outline-secondary" @click="openMenuId = openMenuId === s.sessionId ? null : s.sessionId">
                Actions ▼
              </button>
              <div v-if="openMenuId === s.sessionId"
                   class="card position-absolute mt-2 p-2"
                   style="z-index: 9999; min-width: 220px; white-space: nowrap;">
                <button class="btn btn-sm btn-warning mb-2" @click="showLockInputFor = s.sessionId">Lock</button>
                <div v-if="showLockInputFor === s.sessionId" class="mb-2">
                  <input class="form-control form-control-sm mb-1"
                         placeholder="email1@test.com, email2@test.com"
                         v-model="lockEmails[s.sessionId]" />
                  <button class="btn btn-sm btn-success w-100" @click="lockSession(s.sessionId)">Confirm Lock</button>
                </div>
                <button class="btn btn-sm btn-danger w-100" @click="cancelSession(s.sessionId)">Cancel</button>
              </div>
            </div>
          </td>

        </tr>
        </tbody>
      </table>
    </div>

    <!-- PAGINATION -->
    <nav>
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
  </div>
</template>
