/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import { useCookies } from '@vueuse/integrations/useCookies'
import { useJwt } from '@vueuse/integrations/useJwt'
import { RoleEnum } from '@/types/role.enum.d'
import type { JwtPayload } from 'csengoJwt'
import serviceLogger from '@/utils/logger.custom.util'

const onlyUnauthenticatedPaths = ['/login', '/register', '/tv'];

const userAccessiblePages = ['/', '/snipper'];

const roleProtectedPaths = [
    {
        role: RoleEnum.Admin,
        path: '/admin',
    },
    {
        role: RoleEnum.Teacher,
        path: '/teacher',
    },
];

const logger = serviceLogger('router');

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: setupLayouts(routes),
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
    if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
        if (!localStorage.getItem('vuetify:dynamic-reload')) {
            console.log('Reloading page to fix dynamic import error');
            localStorage.setItem('vuetify:dynamic-reload', 'true');
            location.assign(to.fullPath);
        } else {
            console.error('Dynamic import error, reloading page did not fix it', err);
        }
    } else {
        console.error(err);
    }
});

router.beforeResolve((to, from, next) => {
    const cookies = useCookies();
    const jwtToken = cookies.get('token');
    const { payload } = useJwt(jwtToken);

    if (onlyUnauthenticatedPaths.includes(to.path) && payload.value !== null) {
        next('/');
        return;
    }

    const token: JwtPayload | null = payload.value as JwtPayload | null;

    if (onlyUnauthenticatedPaths.includes(to.path) && token === null) {
        next();
        return;
    }

    if (token === null) {
        next('/login');
        return;
    }

    const currentPathProtected = roleProtectedPaths.some((rpp) => rpp.path === to.path);

    const currentTokenHasRoleForPath = roleProtectedPaths.some((rpp) => {
        const hasRole = token.roles.some((role) => {
            return role === rpp.role;
        });

        return rpp.path === to.path && hasRole;
    });

    if (currentPathProtected && !currentTokenHasRoleForPath) {
        next('/forbidden');
        return;
    }

    next();
});

router.isReady().then(() => {
    localStorage.removeItem('vuetify:dynamic-reload');
});

export default router;
