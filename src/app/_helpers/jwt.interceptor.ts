import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthenticationService, ServerService} from '@app/_services';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if user is logged in and request is to the api url
        const currentUser = this.authenticationService.currentUserValue;
        const isLoggedIn = currentUser && currentUser.token;
        const isApiUrl = request.url.startsWith(ServerService.getApiUrl());
        if (isApiUrl) {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Emby-Client': 'Angular Client',
                'X-Emby-Client-Version': '0.0.1',
                'X-Emby-Device-Name': 'Angular Client',
                'X-Emby-Device-Id': '1',
            };
            if (isLoggedIn) {
                headers['X-MediaBrowser-Token'] = `${currentUser.token}`;
            }
            request = request.clone({setHeaders: headers});
        }
        return next.handle(request);
    }
}
