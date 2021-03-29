import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EmbyUserModel, EmbyMediaModel, EmbyMediaType} from '@app/_models';
import {map} from 'rxjs/operators';
import {ServerService} from '@app/_services/server.service';

@Injectable({providedIn: 'root'})
export class EmbyUserService {

    itemTypes = [EmbyMediaType.Movie, EmbyMediaType.Season, EmbyMediaType.Series, EmbyMediaType.Episode, EmbyMediaType.Folder];
    fields = [
        'ParentId',
        'Path',
        'Revenue',
        'ProductionYear',
    ];
    filters = 'isPlayed';
    recursive = true;

    constructor(private http: HttpClient) {
    }

    getAll(): Promise<EmbyUserModel[]> {
        return this.http.get<EmbyUserModel[]>(`${ServerService.getApiUrl()}/emby/Users`)
            // .pipe(map(response => response.map(item => new User(item)))).toPromise();
            .pipe(map(response => {
                return response.map(item => new EmbyUserModel(item));
            })).toPromise();
    }

    getItems(userId): Promise<EmbyMediaModel[]> {
        return this.http.get<{ Items: EmbyMediaModel[] }>(`${ServerService.getApiUrl()}/emby/Users/${userId}/Items`, {
            params: {
                Recursive: this.recursive.toString(),
                Filters: this.filters,
                Fields: this.fields.join(','),
                IncludeItemTypes: this.itemTypes.join(',')
            }
            // }).pipe(map(response => response.Items)).toPromise();
        }).pipe(map(response => {
            return response.Items;
        })).toPromise();
    }

}
