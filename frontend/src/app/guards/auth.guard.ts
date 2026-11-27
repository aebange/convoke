import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';

function redirectToOwnGroup(router: Router, url: string, groupId: number): ReturnType<Router['createUrlTree']> {
  const segments = url.split('?')[0].split('#')[0].split('/').filter(segment => segment.length > 0);

  let groupIndex = -1;
  if (segments[0] === 'page' && segments[1] === 'select-user') {
    groupIndex = 2;
  } else if (segments[0] === 'page') {
    groupIndex = 1;
  }

  if (groupIndex >= 0 && segments.length > groupIndex) {
    segments[groupIndex] = String(groupId);
    return router.createUrlTree(['/'].concat(segments));
  }

  return router.createUrlTree(['page/select-user', groupId]);
}

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    authService.logout();
    return router.createUrlTree(['']);
  }

  const routeGroupId = route.paramMap.get('groupId');
  const tokenGroupId = authService.groupId();

  if (routeGroupId !== null && tokenGroupId === null) {
    // Authenticated but the token carries no group id; treat it as unusable.
    authService.logout();
    return router.createUrlTree(['']);
  }

  if (routeGroupId !== null && tokenGroupId !== null && Number(routeGroupId) !== tokenGroupId) {
    return redirectToOwnGroup(router, state.url, tokenGroupId);
  }

  return true;
};

export const redirectIfAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  const groupId = authService.groupId();
  return groupId !== null ? router.createUrlTree(['page/select-user', groupId]) : true;
};
