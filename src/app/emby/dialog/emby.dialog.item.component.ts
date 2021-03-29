import {Column, EmbyMediaModel} from '../../_models';
import {Component, OnInit} from '@angular/core';
import {EmbyComponent} from '@app/emby';

@Component({
    template: '<media-item-detail ' +
        'class="media-item-detail" ' +
        '[media]="media" ' +
        '[columns]="columnsByKey" ' +
        '></media-item-detail>'
})
export class EmbyDialogMediaItemComponent implements OnInit {
    public media: EmbyMediaModel;
    public columns: Column[];
    public controller: EmbyComponent;
    public columnsByKey: { [key: string]: Column } = {};

    ngOnInit() {
        this.columns = this.controller.columns;
        this.columns.forEach(c => this.columnsByKey[c.key] = c)
    }
}
