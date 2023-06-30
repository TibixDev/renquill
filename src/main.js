import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

// -- Disable console logs in production
if (import.meta.env.PROD) {
  console.log = function () {};
  console.debug = function () {};
}

// -- Measure app start time
const appStart = Date.now();

// -- Create app
const app = createApp(App);

// -- Middleware
import { router } from "./config/router";
app.use(router);

import VueSweetalert2 from "vue-sweetalert2";
import '@sweetalert2/theme-dark/dark.min.css';
app.use(VueSweetalert2);

// -- Mount app
app.mount("#app");

// -- Measure app start time
console.log(`App mounted in ${Date.now() - appStart}ms`);