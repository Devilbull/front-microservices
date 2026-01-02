import axios from "axios";


const userApi = axios.create({
    baseURL: "http://localhost:8080/api/userservice",
    withCredentials: true,
});

export default userApi;

export const notifApi = axios.create({
    baseURL: "http://localhost:8080/api/notificationservice",
    withCredentials: true,
});