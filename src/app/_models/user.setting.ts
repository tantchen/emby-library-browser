import {Column} from '@app/_models/emby/column';

export class AuthUserSettingsModel {
    private saveTimeOutId;
    private saveTimeOut: number = 100;
    private expectFilterKeys: string[] = ['Name'];

    constructor(private userId) {
        let columns = {};
        try {
            columns = JSON.parse(localStorage.getItem('user-settings-' + userId));
            columns = columns || {};
        } catch (e) {
            columns = {};
        }
        this.columns = columns;
    }

    public columns: {
        [key: string]: {
            sortDir?: (number | boolean),
            active?: boolean,
            filter?: {
                filterArgs?: any[],
            }
        }
    } = {};

    public set column(column: Column) {
        const c = this.columns[column.key] = this.columns[column.key] || {};
        c.sortDir = column.sortDir;
        c.active = column.active;
        if (!this.expectFilterKeys.includes(column.key)) {
            c.filter = c.filter || {};
            if (column.filter && column.filter.filterArgs) {
                c.filter.filterArgs = column.filter.filterArgs;
            }
        }
        if (this.saveTimeOutId) {
            clearTimeout(this.saveTimeOutId);
        }
        this.saveTimeOutId = setTimeout(() => {
            localStorage.setItem('user-settings-' + this.userId, JSON.stringify(this.columns));
        }, this.saveTimeOut);
    }
}
