import {EmbyMediaModel,EmbyMediaType} from '@app/_models/emby/emby.media.model';
import {EmbyLibraryModel} from '@app/_models/emby/emby.library.model';
import {EmbyUserModel} from '@app/_models/emby/emby.user.model';
import {EmbyHelpers} from '@app/emby/emby.helpers';

export class EmbyMediaCollection {
    public mediaItems: EmbyMediaModel[];
    public all: EmbyMediaModel[];
    public items: EmbyMediaModel[];
    public users: EmbyUserModel[];
    public libraries: EmbyLibraryModel[];
    public byID: { [key: string]: EmbyMediaModel } = {};

    constructor(mediaItems: EmbyMediaModel[], libraries: EmbyLibraryModel[], users: EmbyUserModel[]) {
        this.mediaItems = mediaItems;
        this.users = users;
        this.libraries = libraries;
        this.all = mediaItems.filter(item => item.LocationType !== 'Virtual');
        this.items = EmbyHelpers.prepareItems(mediaItems, libraries);
        mediaItems.forEach(m => this.byID[m.Id] = m);
    }

    public getDuplicateItems(): EmbyMediaModel[] {
        return EmbyHelpers.collectDuplicateItems(this.all);
    }

    public getMediaItems(): EmbyMediaModel[] {
        return this.items;
    }

    public removeItem(item: EmbyMediaModel) {
        [this.mediaItems, this.items, this.all].forEach(collection => {
            this.removeItemFromArray(item, collection);
            if (item.Type === EmbyMediaType.Series && Array.isArray(item.Seasons)) {
                item.Seasons.forEach(s => this.removeItem(s));
            }
            if (item.Type === EmbyMediaType.Season && Array.isArray(item.Episodes)) {
                item.Episodes.forEach(s => this.removeItem(s));
            }
            delete this.byID[item.Id];
        });
        return this;
    }

    public removeItemFromArray(item: EmbyMediaModel, collection: EmbyMediaModel[]): boolean {
        let index = collection.indexOf(item);
        if (index === -1) {
            return false;
        }
        collection.splice(index, 1);
        return true;
    }

    public registerUserItems(users: EmbyUserModel[], usersItemsCollection: EmbyMediaModel[][]) {
        usersItemsCollection.forEach((userMediaItems, uIndex) => {
            const user = users[uIndex];
            userMediaItems.forEach(item => {
                if (!this.byID[item.Id]) {
                    if (item.LocationType !== 'Virtual') {
                        console.warn(item.Name, item);
                    }
                    return;
                }
                this.byID[item.Id].registerUserItem(user, item);
            });
        });
        this.items.forEach(m => m.calculateUsersMeta(users));
        return this;
    }
}