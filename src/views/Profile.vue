<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import userApi from "@/api/axios";
import { useRouter } from "vue-router";
const auth = useAuthStore();
const router = useRouter();  // <-- ovde
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
    const res = await userApi.put("/users/me", {
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
    await userApi.patch("/users/me/password", {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    });
    changePassMessage.value = "Password changed successfully! You need to login again.";
    // Logout lokalno i redirect
    auth.logoutLocal();
    await router.push("/login");  // <--- ovde ide redirect
  } catch (err) {
    changePassMessage.value = err.response?.data?.message || "Error changing password";
  }
}
</script>
<template>
  <div class="container py-5">
    <div v-if="auth.user" class="row g-4">

      <!-- LEFT: Profile card -->
      <div class="col-md-4">
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body text-center">
            <!-- Avatar -->
            <div class="rounded-circle bg-primary text-white d-flex
                        align-items-center justify-content-center mx-auto mb-3"
                 style="width: 90px; height: 90px; font-size: 32px;">
              {{ auth.user.username[0].toUpperCase() }}
            </div>

            <h5 class="mb-1">{{ auth.user.username }}</h5>
            <span class="badge bg-secondary mb-2">{{ auth.user.role }}</span>

            <!-- Rang / organizer title -->
            <div v-if="auth.user.gamerStats?.organizerTitle" class="mb-2">
              <span class="badge bg-success">{{ auth.user.gamerStats.organizerTitle }}</span>
            </div>

            <hr>

            <div class="text-start small">
              <p><strong>Full name:</strong> {{ auth.user.fullName }}</p>
              <p><strong>Email:</strong> {{ auth.user.email }}</p>
              <p><strong>Date of birth:</strong> {{ auth.user.dateOfBirth }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Actions -->
      <div class="col-md-8">
        <!-- Gamer stats -->
        <div v-if="auth.user.gamerStats">
          <h6 class="fw-bold mb-3 text-center">Gamer Stats</h6>

          <div class="row g-3">
            <div class="col-md-3">
              <div class="card text-center shadow-sm border-0 rounded-4">
                <div class="card-body">
                  <h4>{{ auth.user.gamerStats.totalSessions }}</h4>
                  <small class="text-muted">Total Sessions</small>
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="card text-center shadow-sm border-0 rounded-4">
                <div class="card-body">
                  <h4>{{ auth.user.gamerStats.attendanceNumber }}%</h4>
                  <small class="text-muted">Attendance</small>
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="card text-center shadow-sm border-0 rounded-4">
                <div class="card-body">
                  <h4>{{ auth.user.gamerStats.numberOfSuccessfulSessions }}</h4>
                  <small class="text-muted">Organized</small>
                </div>
              </div>
            </div>

            <div v-if="auth.user.gamerStats.organizerTitle" class="col-md-3">
              <div class="card text-center shadow-sm border-0 rounded-4">
                <div class="card-body">
                  <h6 class="mb-0">{{ auth.user.gamerStats.organizerTitle }}</h6>
                  <small class="text-muted">Rank</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card shadow-sm border-0 rounded-4 mb-4">
          <div class="card-body">
            <h6 class="fw-bold mb-3">Update Profile</h6>

            <div class="row g-2">
              <div class="col-md-6">
                <input class="form-control" v-model="fullName" placeholder="Full name">
              </div>
              <div class="col-md-6">
                <input type="date" class="form-control" v-model="dateOfBirth">
              </div>
            </div>

            <button class="btn btn-primary mt-3" @click="updateUser">
              Save changes
            </button>

            <p class="text-success small mt-2" v-if="updateMessage">{{ updateMessage }}</p>
          </div>
        </div>

        <!-- Change password -->
        <div class="card shadow-sm border-0 rounded-4 mb-4">
          <div class="card-body">
            <h6 class="fw-bold mb-3">Change Password</h6>

            <input type="password" class="form-control mb-2" v-model="oldPassword" placeholder="Old password" />
            <input type="password" class="form-control mb-2" v-model="newPassword" placeholder="New password" />

            <button class="btn btn-warning" @click="changePassword">
              Change password
            </button>

            <p class="text-success small mt-2" v-if="changePassMessage">{{ changePassMessage }}</p>
          </div>
        </div>



      </div>
    </div>
  </div>
</template>



