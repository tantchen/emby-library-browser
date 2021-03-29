import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class ServerService {

    public static apiUrl: string = '';
    public static serverId: string = '';

    public static getApiUrl(): string {
        if (this.apiUrl) {
            return this.apiUrl;
        }
        const url = localStorage.getItem('emby.url');
        if (url && typeof url === 'string') {
            this.apiUrl = url;
        }
        return this.apiUrl;
    }

    public static getServerId(): string {
        if (this.serverId) {
            return this.serverId;
        }
        const serverId = localStorage.getItem('emby.server-id');
        if (serverId && typeof serverId === 'string') {
            this.serverId = serverId;
        }
        return this.serverId;
    }

    public static setApiUrl(url: string) {
        this.apiUrl = url;
        localStorage.setItem('emby.url', this.apiUrl);
    }

    public static setServerId(id: string) {
        this.serverId = id;
        localStorage.setItem('emby.server-id', this.serverId);
    }
}
