import {Injectable} from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, Observable, throwError} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {environment} from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  public constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isApiRequest = this.isApiRequest(request.url);
    const isLoginRequest = request.url.includes('/api/auth/login');
    const token = this.authService.getToken();

    let authRequest = request;
    if (isApiRequest && !isLoginRequest && token) {
      authRequest = request.clone({
        setHeaders: {Authorization: `Bearer ${token}`}
      });
    }

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && isApiRequest && !isLoginRequest) {
          this.authService.logout();
          this.router.navigate(['']);
        }

        return throwError(() => error);
      })
    );
  }

  private isApiRequest(url: string): boolean {
    return url.startsWith(`${environment.baseUrl}/api/`)
      || url.startsWith('/api/')
      || url.startsWith('./api/')
      || url.startsWith('api/');
  }
}
