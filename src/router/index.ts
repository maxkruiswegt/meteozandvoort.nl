import { createRouter, createWebHistory, type RouteComponent } from 'vue-router';
import { LOCALES, PAGE_PATHS, type Locale, type PageId } from '@/seo/site';
import { i18n } from '@/i18n';

declare module 'vue-router' {
  interface RouteMeta {
    /** null on the not-found page */
    page: PageId | null;
    locale: Locale;
  }
}

const VIEWS: Record<PageId, () => Promise<RouteComponent>> = {
  home: () => import('@/views/Home.vue'),
  current: () => import('@/views/CurrentView.vue'),
  historic: () => import('@/views/HistoricView.vue'),
};

const NotFound = () => import('@/views/NotFound.vue');

// One route per page and language, from the shared table in seo/site.ts.
// Paths end in a slash (the built page is <path>/index.html); the router
// matches the slashless form too.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...(Object.keys(PAGE_PATHS) as PageId[]).flatMap((page) =>
      LOCALES.map((locale) => ({
        path: PAGE_PATHS[page][locale],
        name: `${page}-${locale}`,
        component: VIEWS[page],
        meta: { page, locale },
      }))
    ),
    // Unknown URLs get a real not-found page (noindex) instead of quietly
    // showing the home page, which search engines flag as a soft 404.
    { path: '/en/:pathMatch(.*)*', name: 'not-found-en', component: NotFound, meta: { page: null, locale: 'en' } },
    { path: '/:pathMatch(.*)*', name: 'not-found-nl', component: NotFound, meta: { page: null, locale: 'nl' } },
  ],
});

// After the navigation is confirmed (same tick, before the render): a failed
// navigation, such as a stale chunk after a deploy, must not switch the
// language under the old URL.
router.afterEach((to, _from, failure) => {
  if (!failure) i18n.global.locale.value = to.meta.locale;
});

export default router;
