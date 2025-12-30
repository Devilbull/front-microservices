<script setup>
import { useAuthStore } from "@/stores/auth";


const auth = useAuthStore();


</script>

<template>
  <div class="container mt-5">
    <div class="card mx-auto" style="max-width: 600px;">
      <div class="card-body">
        <h4 class="card-title mb-4">My Profile</h4>

        <div v-if="auth.user">
          <p><strong>ID:</strong> {{ auth.user.id }}</p>
          <p><strong>Username:</strong> {{ auth.user.username }}</p>
          <p><strong>Full Name:</strong> {{ auth.user.fullName }}</p>
          <p><strong>Email:</strong> {{ auth.user.email }}</p>
          <p><strong>Date of Birth:</strong> {{ auth.user.dateOfBirth }}</p>
          <p><strong>Role:</strong> {{ auth.user.role }}</p>
          <p><strong>Status:</strong> {{ auth.user.status }}</p>

          <div v-if="auth.user.gamerStats">
            <h5 class="mt-3">Gamer Stats:</h5>
            <p><strong>Total Sessions:</strong> {{ auth.user.gamerStats.totalSessions }}</p>
            <p><strong>Joined Sessions:</strong> {{ auth.user.gamerStats.numberOfJoinedSessions }}</p>
            <p><strong>Leaving Sessions:</strong> {{ auth.user.gamerStats.numberOfLeavingSessions }}</p>
            <p><strong>Attendance:</strong> {{ auth.user.gamerStats.attendanceNumber }}%</p>
            <p><strong>Successful Sessions:</strong> {{ auth.user.gamerStats.numberOfSuccessfulSessions }}</p>
            <p><strong>Organizer Title:</strong> {{ auth.user.gamerStats.organizerTitle }}</p>
          </div>
        </div>

        <div v-else>
          <p>No user data available.</p>
        </div>
      </div>
    </div>
  </div>
</template>
