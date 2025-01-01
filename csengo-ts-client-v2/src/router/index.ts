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

const userAccessiblePages = ['/'];

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

    // logger.debug(`Unprotected paths check ${unprotectedPaths.includes(to.path)}`, unprotectedPaths)

    const token: JwtPayload | null = payload.value as JwtPayload | null;

    if (onlyUnauthenticatedPaths.includes(to.path) && token === null) {
        // logger.debug('auth path and token sub is null')
        next();
        return;
    }

    if (token === null) {
        // logger.debug('Token is null')
        next('/login');
        return;
    }

    const currentPathProtected = roleProtectedPaths.some((rpp) => rpp.path === to.path);

    const currentTokenHasRoleForPath = roleProtectedPaths.some((rpp) => {
        // logger.debug('Role protected paths', rpp)
        // logger.debug(`RoleCheck role ${rpp.role}`)
        // logger.debug(`Token roles`, token.roles)

        const hasRole = token.roles.some((role) => {
            // logger.debug(`Role check ${role === rpp.role}`, role)
            return role === rpp.role;
        });

        // logger.debug(`Hasrole check ${hasRole}`)
        // logger.debug(`Token roles include ${rpp.role}: ${hasRole}`)
        // logger.debug(`Path check ${rpp.path === to.path}`)
        // logger.debug(`Result ${rpp.path === to.path && hasRole}`)

        return rpp.path === to.path && hasRole;
    });

    // logger.debug(`Current path is protected ${currentPathProtected}`)
    // logger.debug(`Current token has role for path ${currentTokenHasRoleForPath}`)

    if (currentPathProtected && !currentTokenHasRoleForPath) {
        // logger.debug('Redirect to forbidden')
        next('/forbidden');
        return;
    }

    // logger.debug('Continued because all path checks succeeded')
    next();
});

router.isReady().then(() => {
    localStorage.removeItem('vuetify:dynamic-reload');
});

export default router;
