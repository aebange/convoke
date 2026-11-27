import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {ErrorService} from "./error.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private errorService: ErrorService)
  {}

  public intercept(request: HttpRequest<unknown>, next: HttpHandler):
    Observable<HttpEvent<any>>
  {
    return next.handle(request).pipe(
      catchError( (error: HttpErrorResponse) => this.handleErrorRestCall(error, request.url))
    );

  } // end of method


  private handleErrorRestCall(err: HttpErrorResponse, requestUrl: string): Observable<any> {
    if (this.shouldDisplayError(err, requestUrl)) {
      // A REST call raised an error.  So, send the info to the ErrorService
      this.errorService.addError(err);
    }

    // Throw the error
    return throwError(() => err);
  }

  private shouldDisplayError(err: HttpErrorResponse, requestUrl: string): boolean {
    if (err.status < 200 || err.status >= 300) {
      // Login and group-name-check errors are surfaced inline in the login dialog,
      // not in the global error dialog.
      const handledInline = requestUrl.includes('/api/auth/login')
        || requestUrl.includes('/api/groups/check-name');
      return !handledInline;
    }

    return false;
  }
}
