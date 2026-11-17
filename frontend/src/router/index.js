import { createRouter, createWebHashHistory } from "vue-router";
import { sesi } from "../lib/sesi.js";
import KatalogView from "../views/KatalogView.vue";
const LoginView = () => import("../views/LoginView.vue");
const RegistrasiView = () => import("../views/RegistrasiView.vue");
const ProfilPenyediaView = () => import("../views/ProfilPenyediaView.vue");
const PenyediaView = () => import("../views/PenyediaView.vue");
const PesananView = () => import("../views/PesananView.vue");
const DetailPesananView = () => import("../views/DetailPesananView.vue");
const DashboardView = () => import("../views/DashboardView.vue");
const InfoView = () => import("../views/InfoView.vue");

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: KatalogView, meta: { judul: "Katalog" } },
    {
      path: "/login",
      component: LoginView,
      meta: { judul: "Login" },
    },
    {
      path: "/daftar",
      component: RegistrasiView,
      meta: { judul: "Daftar" },
    },
    {
      path: "/akun/penyedia",
      component: ProfilPenyediaView,
      meta: { judul: "Profil usaha", auth: true, peran: "penyedia" },
    },
  ],
});