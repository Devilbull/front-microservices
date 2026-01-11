<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import userApi from "@/api/axios";

const router = useRouter();

const form = ref({
  username: "",
  password: "",
  email: "",
  fullName: "",
  dateOfBirth: ""
});
const today = new Date().toISOString().split("T")[0];

const errorMessage = ref("");
const successMessage = ref("");

async function submitRegister() {
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await userApi.post("/auth/register", form.value);
    successMessage.value = "Registered ! Check email for activation link.";

    // Nakon par sekundi redirect na login
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (e) {
    if (e.response && e.response.data) {
      errorMessage.value = e.response.data.message || "Error occurred";
    } else {
      errorMessage.value = "Error occurred";
    }
  }
}
</script>

<template>
  <div class="container mt-5">
    <div class="card mx-auto" style="max-width: 500px;">
      <div class="card-body">
        <h4 class="card-title mb-4">Register</h4>

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

        <form @submit.prevent="submitRegister">
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input type="text" class="form-control" v-model="form.username" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" v-model="form.password" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" v-model="form.email" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" v-model="form.fullName" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Date of Birth</label>
            <input
                type="date"
                class="form-control"
                v-model="form.dateOfBirth"
                :max="today"
                required
            />
          </div>

          <button type="submit" class="btn btn-primary w-100">Register</button>
        </form>
      </div>
    </div>
  </div>
</template>
