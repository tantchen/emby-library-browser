import {Component, OnInit} from '@angular/core';
import {EmbyComponent} from '@app/emby';

@Component({template: '' +
        '<div class="modal-header">' +
        '    <h5 class="item-title-name m-0 pb-2 pt-2">Confirm Deletion</h5>' +
        '</div>' +
        '<div class="modal-body">' +
        'Are you sure, you want finally delete thees items?' +
        '<br/>'+
        '<br/>'+
        '<br/>'+
        '<button role="button" (click)="cancel()" class="btn btn-primary btn-info mr-3" >Cancel</button>' +
        '<button role="button" (click)="delete()" class="btn btn-primary btn-danger" >Delete</button>' +
        '</div>'
})
export class EmbyDialogDeleteConfirmComponent implements OnInit {
    public embyComponent: EmbyComponent
    constructor() {}

    ngOnInit() {

    }

    public cancel(){
        this.embyComponent.modalRef.hide();
    }

    public delete(){
        this.embyComponent.modalRef.hide();
        this.embyComponent.deleteItems();
    }
}
