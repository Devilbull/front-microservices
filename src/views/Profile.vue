<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import api from "@/api/axios";

const auth = useAuthStore();

// Dropdown control
const showMenu = ref(false);

// Update form
const fullName = ref(auth.user?.fullName || "");
const dateOfBirth = ref(auth.user?.dateOfBirth || "");
const updateMessage = ref("");

// Change password form
const oldPassword = ref("");
const newPassword = ref("");
const changePassMessage = ref("");

async function updateUser() {
  try {
    const res = await api.put("/users/me", {
      fullName: fullName.value,
      dateOfBirth: dateOfBirth.value
    });
    auth.user = res.data; // update store
    updateMessage.value = "Profile updated successfully!";
  } catch (err) {
    updateMessage.value = err.response?.data?.message || "Error updating profile";
  }
}

async function changePassword() {
  try {
    await api.patch("/users/me/password", {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    });
    changePassMessage.value = "Password changed successfully! You need to login again.";
    auth.logoutLocal(); // logout user from store
  } catch (err) {
    changePassMessage.value = err.response?.data?.message || "Error changing password";
  }
}
</script>

<template>
  <div class="container mt-5">
    <div class="card mx-auto" style="max-width: 600px;">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="card-title">My Profile</h4>
          <div class="position-relative">
            <button class="btn btn-secondary" @click="showMenu = !showMenu">
              Actions ▼
            </button>
            <div v-if="showMenu" class="card mt-2 p-3 position-absolute end-0" style="width: 300px; z-index: 10;">
              <!-- Update user -->
              <h5>Update Profile</h5>
              <input class="form-control mb-2" v-model="fullName" placeholder="Full Name" />
              <input type="date" class="form-control mb-2" v-model="dateOfBirth" placeholder="Date of Birth" />
              <button class="btn btn-primary w-100 mb-2" @click="updateUser">Update</button>
              <p class="text-success" v-if="updateMessage">{{ updateMessage }}</p>

              <hr />

              <!-- Change password -->
              <h5>Change Password</h5>
              <input type="password" class="form-control mb-2" v-model="oldPassword" placeholder="Old Password" />
              <input type="password" class="form-control mb-2" v-model="newPassword" placeholder="New Password" />
              <button class="btn btn-warning w-100" @click="changePassword">Change Password</button>
              <p class="text-success" v-if="changePassMessage">{{ changePassMessage }}</p>
            </div>
          </div>
        </div>

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

