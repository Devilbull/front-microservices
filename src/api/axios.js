import axios from "axios";

const userApi = axios.create({
    baseURL: "http://localhost:8080/api/userservice",
    withCredentials: true, // ⬅️ JWT cookie
});

export default userApi;
