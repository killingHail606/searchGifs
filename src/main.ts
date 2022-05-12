import { createApp } from 'vue';
// @ts-ignore
import { registerSW } from 'virtual:pwa-register';
import { router } from '@/routes';
import { store } from '@/store';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader';

const intervalMS = 60 * 1000;

const updateSW = registerSW({
  onRegistered(r: ServiceWorkerRegistration) {
    r && setInterval(() => {
      r.update();
    }, intervalMS);
  },
});

loadFonts().then(() => {
  console.log('Fonts loaded');
});

createApp(App)
  .use(vuetify)
  .use(router)
  .use(store)
  .mount('#app');
