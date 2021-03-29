import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {AuthModel} from '@app/_models/auth';
import {AuthUserSettingsModel} from '@app/_models/user.setting';
import {ServerService} from '@app/_services/server.service';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
    private readonly currentUserSubject: BehaviorSubject<AuthModel>;
    public currentUser: Observable<AuthModel>;
    public userSettings: AuthUserSettingsModel;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<AuthModel>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        if (this.currentUserSubject && this.currentUserSubject.value && this.currentUserSubject.value.id) {
            this.userSettings = new AuthUserSettingsModel(this.currentUserSubject.value.id);
        }
    }

    public get currentUserValue(): AuthModel {
        return this.currentUserSubject.value;
    }

    public userToAuth(response) {
        return {
            id: response.User.Id,
            username: response.User.Name,
            serverId: response.ServerId,
            token: response.AccessToken,
            isAdmin: response.User.Policy.IsAdministrator,
        };
    }

    login(Username: string, Pw: string): Observable<AuthModel> {
        return this.http.post<any>(`${ServerService.getApiUrl()}/emby/Users/AuthenticateByName`,
            {Username, Pw},
            {
                headers: {
                    'X-Emby-Client': 'Angular Library Browser',
                    'X-Emby-Client-Version': '0.0.1',
                    'X-Emby-Device-Name': 'Angular Library Browser',
                    'X-Emby-Device-Id': '1',
                }
            }
        ).pipe(map(response => {
            ServerService.setServerId(response.ServerId)
            const user = this.userToAuth(response);
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            return user;
        }));
    }

    logout(): void {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}
