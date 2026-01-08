<script setup>
import { ref, onMounted } from "vue";
import { gameApi } from "@/api/axios";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const sessions = ref([]);

async function loadSessions() {
  const res = await gameApi.get("/sessions/all");
  sessions.value = res.data.content;
}

async function joinSession(id) {
  await gameApi.post(`/sessions/${id}/join`);
  loadSessions();
}

async function cancelSession(id) {
  await gameApi.post(`/sessions/${id}/cancel`);
  loadSessions();
}

async function lockSession(id) {
  await gameApi.post("/sessions/lock-session", { sessionId: id, emails: [] });
  loadSessions();
}

onMounted(loadSessions);
</script>

<template>
  <div class="container mt-5">
    <h3>Sessions</h3>

    <table class="table mt-3">
      <thead>
      <tr>
        <th>Name</th>
        <th>Game</th>
        <th>Players</th>
        <th>Start</th>
        <th>Actions</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="s in sessions" :key="s.sessionId">
        <td>{{ s.sessionName }}</td>
        <td>{{ s.gameName }}</td>
        <td>{{ s.currentPlayers }}/{{ s.maxPlayers }}</td>
        <td>{{ s.startTime }}</td>

        <td>
          <!-- MY SESSION -->
          <template v-if="s.creatorId === auth.userId">
            <button class="btn btn-danger btn-sm me-1" @click="cancelSession(s.sessionId)">
              Cancel
            </button>
            <button class="btn btn-warning btn-sm" @click="lockSession(s.sessionId)">
              Lock
            </button>
          </template>

          <!-- NOT MY SESSION -->
          <template v-else>
            <button
                v-if="!s.isUserJoined && s.sessionType === 'OPEN'"
                class="btn btn-success btn-sm"
                @click="joinSession(s.sessionId)"
            >
              Join
            </button>

            <span v-else class="text-muted">
                Joined / Closed
              </span>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
