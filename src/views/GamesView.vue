<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import gameApi from "@/api/gameApi";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

/* FILTERS */
const searchName = ref(route.query.gameName || "");
const searchType = ref(route.query.gameType || "");
const sort = ref(route.query.sort || "gameName,asc");

/* PAGINATION */
const page = ref(Number(route.query.page) || 0);
const size = ref(Number(route.query.size) || 5);
const totalPages = ref(0);

/* DATA */
const games = ref([]);

const addError = ref("");

/* MODAL */
const showAddModal = ref(false);
const newGame = ref({
  gameName: "",
  gameDescription: "",
  gameType: "",
});

async function loadGames() {
  const res = await gameApi.getAll({
    page: page.value,
    size: size.value,
    sort: sort.value,
    gameName: searchName.value || undefined,
    gameType: searchType.value || undefined,
  });

  games.value = res.data.content;
  totalPages.value = res.data.totalPages;
}

function goToPage(p) {
  if (p < 0 || p > totalPages.value) return;

  page.value = p;

  router.push({
    path: "/games",
    query: {
      page: p,
      size: size.value,
      sort: sort.value,
      gameName: searchName.value ?? "",
      gameType: searchType.value ?? "",
    },
  });
}

/* ADMIN ACTIONS */
async function deleteGame(name) {
  if (!confirm(`Delete game "${name}"?`)) return;
  await gameApi.deleteGame(name);
  await loadGames();
}

async function deleteAllGames() {
  if (!confirm("DELETE ALL GAMES?")) return;
  await gameApi.deleteAll();
  await loadGames();
}

async function addGame() {
  addError.value = "";

  // VALIDACIJA
  if (!newGame.value.gameName.trim() || !newGame.value.gameType.trim() || !newGame.value.gameDescription.trim()) {
    addError.value = "All fields are required!";
    return;
  }

  try {
    await gameApi.addGame(newGame.value);

    showAddModal.value = false;
    newGame.value = { gameName: "", gameDescription: "", gameType: "" };

    await loadGames();
  } catch (err) {
    addError.value =
        err.response?.data?.message || "Failed to add game";
  }
}

/* WATCH */
watch(
    () => route.query,
    loadGames,
    { immediate: true }
);

import { computed } from "vue";

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
  <div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Games</h3>

      <!-- ADMIN BUTTONS -->
      <div v-if="auth.isAdmin" class="d-flex gap-2">
        <button class="btn btn-success" @click="showAddModal = true">
          + Add Game
        </button>
        <button class="btn btn-danger" @click="deleteAllGames">
          Delete All
        </button>
      </div>
    </div>

    <form class="row mb-3" @submit.prevent="goToPage(0)">
      <div class="col">
        <input
            class="form-control"
            placeholder="Search by name"
            v-model="searchName"
        />
      </div>

      <div class="col">
        <input
            class="form-control"
            placeholder="Search by type"
            v-model="searchType"
        />
      </div>

      <div class="col">
        <select class="form-select" v-model="sort">
          <option value="gameName,asc">Name ↑</option>
          <option value="gameName,desc">Name ↓</option>
          <option value="gameType,asc">Type ↑</option>
          <option value="gameType,desc">Type ↓</option>
        </select>
      </div>

      <div class="col-auto">
        <button class="btn btn-primary" type="submit">
          Apply
        </button>
      </div>
    </form>


    <!-- TABLE -->
    <table class="table table-striped align-middle">
      <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Type</th>
        <th v-if="auth.isAdmin">Actions</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="g in games" :key="g.id">
        <td>{{ g.gameName }}</td>
        <td>{{ g.gameDescription }}</td>
        <td>{{ g.gameType }}</td>

        <td v-if="auth.isAdmin">
          <button
              class="btn btn-sm btn-danger"
              @click="deleteGame(g.gameName)"
          >
            Delete
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- PAGINATION -->
    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: page === 0 }">
          <button class="page-link" @click="goToPage(page - 1)">
            Previous
          </button>
        </li>

        <li
            v-for="p in pagesToShow"
            :key="p"
            class="page-item"
            :class="{ active: page + 1 === p, disabled: p === '...' }"
        >
          <button
              v-if="p !== '...'"
              class="page-link"
              @click="goToPage(p - 1)"
          >
            {{ p }}
          </button>
          <span v-else class="page-link">...</span>
        </li>

        <li class="page-item" :class="{ disabled: page === totalPages - 1 }">
          <button class="page-link" @click="goToPage(page + 1)">
            Next
          </button>
        </li>
      </ul>
    </nav>

    <!-- ADD GAME MODAL -->
    <div v-if="showAddModal" class="overlay" @click.self="showAddModal = false">
      <div class="modal-box">
        <h5>Add Game</h5>
        <div v-if="addError" class="alert alert-danger mb-3">
          {{ addError }}
        </div>
        <input
            class="form-control mb-2"
            placeholder="Game name"
            v-model="newGame.gameName"
        />

        <input
            class="form-control mb-2"
            placeholder="Game type"
            v-model="newGame.gameType"
        />

        <textarea
            class="form-control mb-3"
            placeholder="Description"
            v-model="newGame.gameDescription"
        />

        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-secondary" @click="showAddModal = false">
            Cancel
          </button>
          <button class="btn btn-success" @click="addGame">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  background: white;
  width: 100%;
  max-width: 480px;
  border-radius: 8px;
  padding: 1rem;
}
</style>
