<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { gameApi } from "@/api/axios";
import { useAuthStore } from "@/stores/auth";
import {isDisabled} from "bootstrap/js/src/util/index.js";

/* CORE */
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();


//
const isOwner = (s) => auth.user?.id === s.creatorId;
const isAdmin = computed(() => auth.isAdmin);

const getActionsCount = (s) => {
  let count = 0;
  if (canLock(s)) count++;
  if (canCancel(s)) count++;
  if (canJoin(s)) count++;
  return count;
};


const canSeeActions = (s) =>
    s.sessionStatus === "SCHEDULED" &&
    (isOwner(s) || isAdmin.value);

const canLock = (s) =>
    s.sessionStatus === "SCHEDULED" && isOwner(s);

const canCancel = (s) =>
    s.sessionStatus === "SCHEDULED" &&
    (isOwner(s) || isAdmin.value);

const canJoin = (s) =>
    !isOwner(s) && !s.isUserJoined && s.sessionStatus === "SCHEDULED" && !isAdmin.value;

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

// Err
const errorMessage = ref(null);
const errorTimer = ref(null);

function showError(msg) {
  errorMessage.value = msg;

  if (errorTimer.value) {
    clearTimeout(errorTimer.value);
  }

  errorTimer.value = setTimeout(() => {
    errorMessage.value = null;
  }, 5000);
}


/* LOAD */
async function loadSessions() {
  try {
    const params = {
      page: page.value,
      size: size.value,
      sort: sort.value,
      sessionName: searchKeywords.value || undefined,
      gameName: searchGame.value || undefined,
      sessionType: searchSessionType.value || undefined,
      maxNumPlayers: searchMaxPlayers.value || undefined,
      isJoined: searchIsJoined.value
          ? searchIsJoined.value === "true"
          : undefined,
    };

    const endpoint = onlyMySessions.value
        ? "/sessions/my"
        : "/sessions/all";

    const res = await gameApi.get(endpoint, { params });

    sessions.value = res.data.content;
    totalPages.value = res.data.totalPages;

  } catch (err) {
    showError(err);
  }
}

async function cancelSession(id) {
  try {
    await gameApi.post(`/sessions/${id}/cancel`);

    openMenuId.value = null;
    loadSessions();

  } catch (err) {
    showError(err);
  }
}


async function lockSession(id) {
  try {
    const emails = (lockEmails.value[id] || "")
        .split(/[\s,]+/)
        .map(e => e.trim())
        .filter(Boolean);

    await gameApi.post("/sessions/lock-session", {
      sessionId: id,
      emails
    });

    // ✅ zatvori modal
    showLockInputFor.value = null;

    // ✅ očisti podatke
    delete lockEmails.value[id];

    openMenuId.value = null;

    loadSessions();

  } catch (err) {
    // ✅ zatvori modal
    showLockInputFor.value = null;
    const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unexpected error occurred";

    showError(msg);
  }
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

async function joinSession(sessionId) {
  try {
    await gameApi.post(`/sessions/${sessionId}/join`);
    loadSessions();
  } catch (err) {
    const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unexpected error occurred";
    showError(msg);
  }
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
    <div v-if="errorMessage"
         class="alert alert-danger alert-dismissible fade show"
         role="alert">
      {{ errorMessage }}
    </div>
    <!-- TABLE -->
    <div class="table-responsive">
      <table class="table table-striped table-hover align-middle">
        <thead>
        <tr>
          <th>Name</th>
          <th>Game</th>
          <th>Description</th>
          <th>Type</th>
          <th>Owner</th>
          <th>Players</th>
          <th>Joined?</th>
          <th>Start</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="s in sessions" :key="s.sessionId">
          <td>{{ s.sessionName }}</td>
          <td>{{ s.gameName }}</td>
          <td>{{ s.description }}</td>
          <td>
          <span :class="{'badge bg-info': s.sessionType === 'OPEN', 'badge bg-secondary': s.sessionType === 'CLOSED'}">
            {{ s.sessionType }}
          </span>
          </td>
          <td>
  <span :class="['badge', auth.user?.id === s.creatorId ? 'bg-primary' : 'bg-secondary']">
    {{ auth.user?.id === s.creatorId ? 'Me' : s.ownerUsername }}
  </span>
          </td>
          <td>{{ s.currentPlayers }}/{{ s.maxPlayers }}</td>
          <td>
          <span :class="['badge', s.isUserJoined ? 'bg-success' : 'bg-secondary']">
            {{ s.isUserJoined ? 'Yes' : 'No' }}
          </span>
          </td>
          <td>{{ new Date(s.startTime).toLocaleString() }}</td>
          <td>
          <span :class="{
            'badge bg-success': s.sessionStatus === 'SCHEDULED',
            'badge bg-secondary': s.sessionStatus === 'FINISHED',
            'badge bg-danger': s.sessionStatus === 'CANCELLED'
          }">{{ s.sessionStatus }}</span>
          </td>
          <td style="min-width: 220px;">
            <!-- OWNER DROPDOWN -->
            <div v-if="isOwner(s) && getActionsCount(s) > 0">
              <button
                  class="btn btn-sm btn-outline-secondary"
                  @click="openMenuId = openMenuId === s.sessionId ? null : s.sessionId">
                Actions ▼
              </button>

              <div v-if="openMenuId === s.sessionId"
                   class="card position-absolute mt-2 p-2"
                   style="z-index: 9999; min-width: 220px; white-space: nowrap;">

                <button v-if="canLock(s)"
                        class="btn btn-sm btn-warning mb-2"
                        @click="showLockInputFor = s.sessionId; openMenuId = null">
                  Lock
                </button>

                <button v-if="canCancel(s)" class="btn btn-sm btn-danger w-100"
                        @click="cancelSession(s.sessionId)">
                  Cancel
                </button>
              </div>
            </div>

            <!-- ADMIN / NON-OWNER sa 1 akcijom -->
            <div v-else-if="getActionsCount(s) === 1">
              <button v-if="canCancel(s)" class="btn btn-sm btn-danger" @click="cancelSession(s.sessionId)">
                Cancel
              </button>
              <button v-else-if="canJoin(s)" class="btn btn-sm btn-success" @click="joinSession(s.sessionId)">
                Join
              </button>
            </div>

            <!-- ADMIN / NON-OWNER sa više akcija -->
            <div v-else-if="getActionsCount(s) > 1">
              <button
                  class="btn btn-sm btn-outline-secondary"
                  @click="openMenuId = openMenuId === s.sessionId ? null : s.sessionId">
                Actions ▼
              </button>

              <div v-if="openMenuId === s.sessionId"
                   class="card position-absolute mt-2 p-2"
                   style="z-index: 9999; min-width: 220px; white-space: nowrap;">
                <button v-if="canCancel(s)" class="btn btn-sm btn-danger w-100" @click="cancelSession(s.sessionId)">
                  Cancel
                </button>
                <button v-if="canJoin(s)" class="btn btn-sm btn-success w-100" @click="joinSession(s.sessionId)">
                  Join
                </button>
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

  <!-- LOCK MODAL -->
  <div v-if="showLockInputFor" class="modal-backdrop-custom">
    <div class="modal-card">
      <h5 class="mb-2">Lock Session</h5>

      <textarea
          class="form-control mb-3"
          rows="10"
          placeholder="Enter emails (comma, space or new line separated)"
          v-model="lockEmails[showLockInputFor]"
      ></textarea>

      <div class="d-flex gap-2 justify-content-end">
        <button class="btn btn-secondary"
                @click="showLockInputFor = null">
          Cancel
        </button>

        <button class="btn btn-success"
                @click="lockSession(showLockInputFor)">
          Confirm Lock
        </button>
      </div>
    </div>
  </div>
</template>


<style scoped>
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}
</style>