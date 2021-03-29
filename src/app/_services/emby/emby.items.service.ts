import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {EmbyMediaModel, EmbyMediaType} from '@app/_models';
import {ServerService} from '@app/_services/server.service';

@Injectable({providedIn: 'root'})
export class EmbyItemsService {
    fields = [
        'DateCreated',
        'Genres',
        'IndexOptions',
        'MediaStreams',
        'Overview',
        'ParentId',
        'Path',
        'Revenue',
        'SortName',
        'ProductionYear',
        'CommunityRating',
    ];
    itemTypes = [EmbyMediaType.Movie, EmbyMediaType.Season, EmbyMediaType.Series, EmbyMediaType.Episode, EmbyMediaType.Folder];
    recursive = true;
    listLimit = 100000;


    constructor(private http: HttpClient) {
    }

    getAll() {
        return this.http.get<{ Items: EmbyMediaModel[] }>(`${ServerService.getApiUrl()}/emby/Items`, {
            params: {
                Limit: this.listLimit.toString(),
                Recursive: this.recursive.toString(),
                Fields: this.fields.join(','),
                IncludeItemTypes: this.itemTypes.join(','),
            }
        }).pipe(map(response => {
            return response.Items.map(item => new EmbyMediaModel(item));
        })).toPromise();
    }

    deleteItem(item: EmbyMediaModel): Promise<EmbyMediaModel>{
        // return new Promise<EmbyMediaModel>(resolve => {
        //     setTimeout(() => {
        //         resolve(item);
        //     }, 500);
        // });
        return this.http.delete<{ Status: string }>(`${ServerService.getApiUrl()}/emby/Items/${item.Id}`, {})
            .pipe(map(() => {return item}))
            .toPromise();
    }
}

