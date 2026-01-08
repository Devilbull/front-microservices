<script setup>
import { ref, onMounted, computed } from "vue";
import { gameApi } from "@/api/axios";
import userApi from "@/api/axios";

// ==========================
// STATE
// ==========================
const loading = ref(true)
const canCreate = ref(false)
const errorMessage = ref("")

const eligibility = ref({
  blocked: false,
  attendanceOk: true
})

const form = ref({
  sessionName: "",
  gameName: "",      // string za izabranu igru
  maxPlayers: 2,
  sessionType: "OPEN",
  startOfSession: "",
  description: ""
})

// ==========================
// FORM VALIDATION
// ==========================
const isFormValid = computed(() =>
    form.value.sessionName &&
    form.value.gameName &&
    form.value.description &&
    form.value.startOfSession &&
    form.value.maxPlayers >= 1
)

// ==========================
// CHECK ELIGIBILITY
// ==========================
async function checkEligibility() {
  try {
    const res = await userApi.get("/users/session-eligibility")
    eligibility.value = res.data

    canCreate.value = !res.data.blocked && res.data.attendanceOk
    if (!canCreate.value) {
      if (res.data.blocked) errorMessage.value = "Your account is blocked."
      else if (!res.data.attendanceOk) errorMessage.value = "Your attendance is below 90%."
    }
  } catch (e) {
    canCreate.value = false
    errorMessage.value = "Failed to check eligibility."
  } finally {
    loading.value = false
  }
}

// ==========================
// LOAD GAMES (bez paginacije)
// ==========================
const games = ref([])
const gamesLoading = ref(false)

async function loadGames() {
  if (games.value.length > 0) return // već učitane igre
  gamesLoading.value = true
  try {
    const res = await gameApi.get("/games/all", {
      params: { page: 0, size: 1000, sort: "gameName,asc" } // uzimamo sve igre
    })
    games.value = res.data.content
  } catch (e) {
    console.error("Failed to load games", e)
  } finally {
    gamesLoading.value = false
  }
}

// ==========================
// CREATE SESSION
// ==========================
async function createSession() {
  try {
    await gameApi.post("/sessions/create-session", {
      ...form.value,
      startOfSession: form.value.startOfSession
          ? new Date(form.value.startOfSession).toISOString()
          : null
    })
    alert("Session created successfully 🎮")
    // reset forme
    form.value = { sessionName:"", gameName:"", maxPlayers:2, sessionType:"OPEN", startOfSession:"", description:"" }
  } catch (e) {
    alert(e.response?.data?.message || "Failed to create session")
  }
}

// ==========================
// ON MOUNT
// ==========================
onMounted(async () => {
  await checkEligibility()
  // igre ćemo učitati tek kada user fokusira dropdown
})
</script>

<template>
  <div class="container mt-5" style="max-width: 640px">
    <h3 class="mb-4">Create Session</h3>

    <div v-if="loading" class="alert alert-info">Checking eligibility...</div>
    <div v-else-if="!canCreate" class="alert alert-danger">{{ errorMessage }}</div>

    <form v-else @submit.prevent="createSession" class="card p-4 shadow-sm">

      <div class="mb-3">
        <label class="form-label">Session Name</label>
        <input v-model="form.sessionName" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Game</label>
        <select
            v-model="form.gameName"
            class="form-select"
            :disabled="gamesLoading"
            required
            @focus="loadGames()"
        >
          <option value="" disabled>
            {{ gamesLoading ? "Loading games..." : "Select a game" }}
          </option>
          <option v-for="g in games" :key="g.id" :value="g.gameName">
            {{ g.gameName }} ({{ g.gameType }})
          </option>
        </select>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Max Players</label>
          <input type="number" min="1" v-model.number="form.maxPlayers" class="form-control" />
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">Session Type</label>
          <select v-model="form.sessionType" class="form-select">
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Start Time</label>
        <input type="datetime-local" v-model="form.startOfSession" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Description</label>
        <textarea v-model="form.description" rows="3" class="form-control" required></textarea>
      </div>

      <button class="btn btn-primary w-100" :disabled="!isFormValid">Create Session</button>
    </form>
  </div>
</template>
