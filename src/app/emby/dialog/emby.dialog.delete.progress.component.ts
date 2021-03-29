import {Component, OnInit} from '@angular/core';
import {EmbyComponent} from '@app/emby';

@Component({
    template: '' +
        '<div class="modal-header">Delete Items...</div>' +
        '<div class="modal-body">' +
        '   <progressbar [animate]="false" [max]="progress.count" [value]="progress.done"></progressbar>' +
        '</div>'
})
export class EmbyDialogDeleteProgressComponent implements OnInit {
    public embyComponent: EmbyComponent;
    public progress: { done: number, count: number };

    ngOnInit() {

    }
}
