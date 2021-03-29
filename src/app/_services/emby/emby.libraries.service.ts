import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {EmbyLibraryModel} from '@app/_models';
import {ServerService} from '@app/_services/server.service';

@Injectable({providedIn: 'root'})
export class EmbyLibrariesService {


    constructor(private http: HttpClient) {
    }


    getAll(): Promise<EmbyLibraryModel[]> {
        return this.http.get<EmbyLibraryModel[]>(`${ServerService.getApiUrl()}/emby/Library/VirtualFolders`)
            .pipe(map(response => response.map(item => new EmbyLibraryModel(item)))).toPromise();
    }
}

