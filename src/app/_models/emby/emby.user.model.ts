export class EmbyUserModel {
    Id: number;
    Name: string;
    Selected: boolean = true;
    Policy: {
        IsAdministrator: boolean,
        EnableContentDeletion: boolean,
        EnableContentDeletionFromFolders: string[],
    };

    constructor(props) {
        Object.assign(this, props);
    }
}
