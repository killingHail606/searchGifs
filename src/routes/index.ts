import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/IndexPage.vue'),
    meta: { title: 'Search Gifs' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return {
      top: 0,
      left: 0,
      behavior: 'smooth',
    };
  },
  routes,
});

router.beforeEach((to, from, next) => {
  // @ts-ignore
  document.title = to.meta.title;
  next();
});

export {
  router,
};
