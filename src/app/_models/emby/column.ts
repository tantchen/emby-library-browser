import {EmbyMediaModel} from '@app/_models/emby/emby.media.model';
import {EmbyComponent} from '@app/emby';
import {FormControl} from '@angular/forms';

declare var $: any;

interface Filter {
    type: string,
    filterArgs: (null | string | number)[],
    switchValues?: (null | string | number)[],

    prepare?(value: any): any,

    filter(items: EmbyMediaModel[], value: any, filterArgs?: any[]): EmbyMediaModel[],

    options?: { value: (null | string | number), label: string }[],

    handleInput?(value: (null | string | number)) : void

    handleSwitch?(): void
}

export class Column {
    public key: string;
    public asColumn: boolean = true
    public width?: string;
    public label?: string;
    public active: boolean = false;
    public sortDir: (number | boolean) = false;
    public filterValue: FormControl;
    public isActive: FormControl;

    public output?(value: any, item?: EmbyMediaModel): string;

    public filter: Filter = {
        type: 'text',
        filterArgs: [null, null],
        filter: (items: EmbyMediaModel[], value: any, filterArgs?: any[]): EmbyMediaModel[] => items,
    };

    constructor(props, protected embyComponent: EmbyComponent) {
        props.filter = props.filter || {};
        props.filter.filterArgs = props.filter.filterArgs || [null];
        Object.assign(this, props);
        if (!this.output) {
            this.output = (v: any, item?: EmbyMediaModel) => v.toString();
        }
        if (!this.filter.filterArgs) {
            this.filter.filterArgs = [null, 'gt'];
        }
        if (!this.filter.handleInput) {
            this.filter.handleInput = (value) => {
                this.filter.filterArgs[0] = value || null;
                embyComponent.t.page = 1;
                embyComponent.updateMediaItems();
            };
        }
        if (!this.filter.handleSwitch) {
            this.filter.handleSwitch = () => {
                const cI = this.filter.switchValues.indexOf(this.filter.filterArgs[1]);
                this.filter.filterArgs[1] = this.filter.switchValues[cI ? 0 : 1];
                embyComponent.t.page = 1;
                embyComponent.updateMediaItems();
            };
        }
        if (!this.filter.prepare) {
            this.filter.prepare = v => v;
        }
        const handleInput = this.filter.handleInput;
        this.filter.handleInput = (value) => {
            embyComponent.auth.userSettings.column = this;
            handleInput(value);
        };
        this.combineWithUserSettings()
    }

    public setActive(active) {
        this.active = active;
        this.embyComponent.auth.userSettings.column = this;
        this.embyComponent.update();
    }

    public setSortDir(sort) {
        this.sortDir = sort;
        this.embyComponent.auth.userSettings.column = this;
    }

    private combineWithUserSettings(){
        const auth = this.embyComponent.auth;
        if(!auth || !auth.userSettings || !auth.userSettings.columns){
            return;
        }
        const userC = auth.userSettings.columns;
        if (userC[this.key]) {
            const uc = userC[this.key];
            this.active = uc.active;
            this.sortDir = uc.sortDir;
            if (uc.filter && uc.filter.filterArgs) {
                this.filter.filterArgs = uc.filter.filterArgs;
            }
        }
        this.filterValue = new FormControl(this.filter.filterArgs[0]);
        this.filterValue.valueChanges.subscribe(v => this.filter.handleInput(v))
        this.isActive = new FormControl(this.active);
        this.isActive.valueChanges.subscribe(v => this.setActive(v))
    }
}