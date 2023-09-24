import { createApp } from 'vue';
import { createRouter, createWebHistory } from "vue-router";
import './style.css'
import App from './App.vue'
import MonthReport from "./components/MonthReport.vue";
import Home from "./components/Home.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Home },
        { path: '/report/month/:gid/:date?', component: MonthReport },
    ]
});

const app = createApp(App);

app.use( router )
   .mount('#app');
