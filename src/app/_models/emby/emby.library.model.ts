import {EmbyUserModel} from '@app/_models/emby/emby.user.model';
import {EmbyMediaModel} from '@app/_models/emby/emby.media.model';

export class EmbyLibraryModel {
    ItemId: string;
    Name: string;
    Type: string;
    Size: number;
    Selected: boolean=true;
    CollectionType?: string;
    Locations: string[];
    CanDelete: boolean=false;
    MediaItems: EmbyMediaModel[];

    constructor(props) {
        Object.assign(this, props);
        this.MediaItems = [];
    }

    public setCanDelete(user: EmbyUserModel){
        this.CanDelete = user.Policy.EnableContentDeletion || user.Policy.EnableContentDeletionFromFolders.includes(this.ItemId);
        return this;
    }
}
