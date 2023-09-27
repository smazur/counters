import { createApp } from 'vue';
import { createRouter, createWebHistory } from "vue-router";
import './style.css'
import App from './App.vue'
import MonthReport from "./components/MonthReport.vue";
import Home from "./components/Home.vue";
import i18n from "./plugins/i18n.js";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Home },
        { path: '/report/month/:gid/:date?', component: MonthReport },
    ]
});

const app = createApp(App);

app.use( router )
   .use( i18n, {
       baseUrl: '/langs/',
       options: [
           { value: 'en', title: 'English' },
           { value: 'ru', title: 'Русский' },
       ]
   } )
   .mount('#app');
