import {EmbyMediaCollection} from '@app/_models';
import {EmbyDialogDeleteConfirmComponent} from '@app/emby/dialog/emby.dialog.delete.confirm.component';
import {EmbyDialogDeleteProgressComponent} from '@app/emby/dialog/emby.dialog.delete.progress.component';
import {EmbyDialogMediaItemComponent} from '@app/emby/dialog/emby.dialog.item.component';
import {EmbyHelpers} from '@app/emby/emby.helpers';
import {EmbyComponentTemplateData} from '@app/emby/emby.component.template.data';
import {EmbyComponentIcons} from '@app/emby/emby.component.icons';
import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {
    AuthenticationService,
    EmbyItemsService,
    EmbyLibrariesService,
    EmbyUserService,
} from '@app/_services';
import {AuthModel, Column, ColumnCollection, EmbyLibraryModel, EmbyMediaModel, EmbyUserModel} from '@app/_models';
import {Promise} from 'bluebird';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';

@Component({
    encapsulation: ViewEncapsulation.None,
    templateUrl: 'emby.component.html',
    styleUrls: ['emby.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class EmbyComponent {
    public loading = false;
    public users: EmbyUserModel[];
    public ResultMode = {Default: 0, DefaultCache: [], Duplicate: 1, DuplicateCache: []};
    public libraries: EmbyLibraryModel[];
    public trashMediaItems: EmbyMediaModel[] = [];
    public activeFilterCount: number = 0;
    private authUser: AuthModel;
    public mediaItems: EmbyMediaModel[] = [];
    public tableItems: EmbyMediaModel[] = [];
    public duplicateItems: EmbyMediaModel[] = [];
    public t = new EmbyComponentTemplateData().getData();
    public fa = new EmbyComponentIcons().getIcons();
    public progress: { count: number, done: number } = {count: 0, done: 0};
    public columns: Column[];
    public mediaColl: EmbyMediaCollection;
    public modalRef: BsModalRef;


    constructor(
        private userService: EmbyUserService,
        private itemsService: EmbyItemsService,
        private librariesService: EmbyLibrariesService,
        public bsModalService: BsModalService,
        public auth: AuthenticationService,
    ) {
        this.authUser = auth.currentUserValue;
    }

    // noinspection JSUnusedGlobalSymbols
    ngOnInit() {
        this.t.resultMode = this.ResultMode.Default;
        this.columns = this.t.columns = new ColumnCollection(this).getColumns();
        this.t.activeColumns = this.t.columns.filter(c => c.active);
        this.columns.forEach(c => this.t.columnsByKey[c.key] = c);
        this.t.filters = {
            main: this.columns.find(c => c.key === 'Name'),
            others: this.columns.filter(c => c.filter.type && c.key !== 'Name')
        };
        this.loading = true;
        this.progress.done = 0;
        this.progress.count = 3;
        Promise.all([
            this.userService.getAll().finally(() => this.progress.done++),
            this.itemsService.getAll().finally(() => this.progress.done++),
            this.librariesService.getAll().finally(() => this.progress.done++),
        ]).then(([users, mediaItems, libraries]) => {
            this.users = users;
            this.libraries = libraries;
            this.libraries.forEach(lib => lib.setCanDelete(users.find(u => u.Id === this.authUser.id)));
            this.mediaColl = new EmbyMediaCollection(mediaItems, libraries, users);
            this.mediaItems = this.mediaColl.getMediaItems();
            this.duplicateItems = this.mediaColl.getDuplicateItems();
            this.prepareColumns();
            EmbyHelpers.sortItems(this.mediaItems, this.sortObject);
            this.loading = false;
            this.updateUserCount().updateMediaItems();
            this.progress.done = 0;
            this.progress.count = this.users.length;
            Promise.mapSeries(this.users, user => {
                this.progress.done++;
                return this.userService.getItems(user.Id);
            }).then((usersItems: EmbyMediaModel[][]) => {
                this.mediaColl.registerUserItems(this.users, usersItems);
            });
        });
    }

    set pageLimit(limit) {
        this.t.limit = limit;
        this.updateMediaItems();
    }

    set pageNumber(page) {
        this.t.page = page;
        this.updateMediaItems();
    }

    get pageNumber(): number {
        return this.t.page;
    }

    public updateMediaItems() {
        const start = this.t.limit * (this.t.page - 1);
        const end = this.t.limit * this.t.page;
        let mediaItems = this.mediaItems;
        this.activeFilterCount = 0;
        this.columns.forEach(c => {
            if (!c.filter || !c.filter.filterArgs[0]) {
                return;
            }
            const value = c.filter.prepare(c.filter.filterArgs[0]);
            mediaItems = c.filter.filter(mediaItems, value, c.filter.filterArgs);
            this.activeFilterCount++;
        });
        const activeLibraries = this.libraries.filter(l => l.Selected);
        mediaItems = mediaItems.filter(item => activeLibraries.includes(item.Library));
        EmbyHelpers.generatePaginationOptions(mediaItems, this.t);
        this.tableItems = mediaItems.filter((m, i) => {
            return i >= start && end > i;
        });
        return this;
    }

    private updateUserCount() {
        this.t.selectedUserCount = this.users.filter(u => u.Selected).length;
        return this;
    }

    private get sortObject() {
        const sortObject = {};
        this.columns.forEach(sorter => {
            if (sorter.sortDir === 0) {
                return;
            }
            sortObject[sorter.key] = sorter.sortDir;
        });
        return sortObject;
    }

    public flipSort(column) {
        if (!column) {
            return;
        }
        const sortDir = column.sortDir || -1;
        this.columns.forEach(c => c.setSortDir(0));
        column.setSortDir(sortDir === 1 ? -1 : sortDir === -1 ? 1 : sortDir);
        EmbyHelpers.sortItems(this.mediaItems, this.sortObject);
        this.updateMediaItems();
    }

    public toggleUserActivation(user: EmbyUserModel) {
        user.Selected = !user.Selected;
        this.mediaItems.forEach(item => item.calculateUsersMeta(this.users));
        EmbyHelpers.sortItems(this.mediaItems, this.sortObject);
        this.updateMediaItems();
    }

    public deleteItems() {
        const updateView = () => {
            if (this.t.resultMode === this.ResultMode.Duplicate) {
                this.mediaItems = this.duplicateItems = this.mediaColl.getDuplicateItems();
            } else {
                this.mediaItems = this.mediaColl.getMediaItems();
            }
            EmbyHelpers.sortItems(this.mediaItems, this.sortObject);
        };
        const progress = {count: this.trashMediaItems.length, done: 0};
        Promise.mapSeries(this.trashMediaItems, item => {
            return new Promise((resolve, reject) => {
                this.itemsService.deleteItem(item).then(() => {
                    this.mediaColl.removeItem(item);
                    this.mediaColl.removeItemFromArray(item, this.trashMediaItems);
                    updateView();
                    this.updateMediaItems();
                    return resolve(item);
                }).catch(reject).finally(() => {
                    progress.done++;
                });
            });
        }).then(() => {
            this.modalRef.hide();
            updateView();
            this.updateMediaItems();
        }).catch(() => {
            this.modalRef.hide();
            updateView();
            this.updateMediaItems();
        });
        const initialState = {
            embyComponent: this,
            progress: progress
        };
        this.modalRef = this.bsModalService.show(EmbyDialogDeleteProgressComponent, {
            class: 'modal-lg',
            ignoreBackdropClick: true,
            initialState,
        });
    }

    public confirmDeleteItems() {
        const initialState = {
            embyComponent: this
        };
        this.modalRef = this.bsModalService.show(EmbyDialogDeleteConfirmComponent, {
            class: 'modal-lg',
            initialState
        });
    }


    public toggleLibraryActivation(library: EmbyLibraryModel) {
        library.Selected = !library.Selected;
        this.updateMediaItems();
    }

    public selectItem(item: EmbyMediaModel) {
        console.log(item);
        const initialState = {
            media: item,
            controller: this
        };
        this.bsModalService.show(EmbyDialogMediaItemComponent, {
            class: 'modal-lg media-details-dialog',
            initialState
        });
        return;
    }

    public setSelectedItems(items: (EmbyUserModel[] | EmbyLibraryModel[]), selected: boolean) {
        items.forEach(i => i.Selected = selected);
        if (items[0] && items[0] instanceof EmbyUserModel) {
            this.mediaItems.forEach(item => item.calculateUsersMeta(this.users));
            EmbyHelpers.sortItems(this.mediaItems, this.sortObject);
        }
        this.updateMediaItems();
    }

    public update() {
        this.t.columns = Array.from(this.t.columns);
        this.t.activeColumns = this.t.columns.filter(c => c.active);
        this.tableItems = Array.from(this.tableItems);
    }

    public switchResultMode() {
        if (this.t.resultMode === this.ResultMode.Default) {
            this.t.resultMode = this.ResultMode.Duplicate;
            this.mediaItems = this.mediaColl.getDuplicateItems();
        } else {
            this.t.resultMode = this.ResultMode.Default;
            this.mediaItems = this.mediaColl.getMediaItems();
        }
        EmbyHelpers.sortItems(this.mediaItems, this.sortObject);
        this.updateMediaItems();
    }

    public get activeUserCount() {
        return this.users.filter(u => u.Selected).length;
    }

    public get activeLibraryCount() {
        return this.libraries.filter(l => l.Selected).length;
    }

    public get trashFileSize() {
        return this.trashMediaItems.reduce((init, i) => init + i.Size, 0);
    }

    private prepareColumns() {
        ['AudioCodec', 'VideoCodec', 'Resolution', 'Language'].forEach(k => {
            const column = this.columns.find(c => c.key === k);
            if (column) {
                column.filter.options = EmbyHelpers.getOptionsFromMediaItems(this.mediaColl.all, k);
            }
        });
        return this;
    }

    public updateTrash() {
        this.trashMediaItems = this.mediaItems.filter(m => m.Selected);
    }

    public get progressPercent(): number {
        if (!this.progress.count) {
            return 0;
        }
        return Math.round((this.progress.done / this.progress.count) * 100);
    }
}
