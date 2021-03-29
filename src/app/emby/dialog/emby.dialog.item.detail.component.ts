import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {Column, EmbyMediaModel, EmbyMediaType} from '@app/_models';


@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'media-item-detail',
    templateUrl: 'emby.dialog.item.detail.html',
    styleUrls: ['emby.dialog.item.detail.scss'],
})
export class EmbyDialogMediaItemDetailComponent implements OnInit {

    public EmbyMediaType = EmbyMediaType

    constructor() {

    }

    @Input() media: EmbyMediaModel;
    @Input() columns: { [key: string]: Column };

    ngOnInit() {
    }
}
