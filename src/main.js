import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { setupInterceptors } from "./api/interceptors.js";


import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const app = createApp(App);

app.use(createPinia());
app.use(router);

setupInterceptors();



app.mount("#app");
