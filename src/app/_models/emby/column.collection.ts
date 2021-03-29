import {EmbyComponent} from '@app/emby';
import {EmbyMediaModel, EmbyMediaType} from './emby.media.model';
import {AgePipe} from '@app/_pipes/age.pipe';
import {FileSizePipe} from '@app/_pipes/file-size.pipe';
import {Column} from '@app/_models/emby/column';

export class ColumnCollection {

    constructor(private embyComponent: EmbyComponent) {
    }

    public getColumns(): Column[] {
        return [
            this.Select,
            this.Name,
            this.addDateFilter(this.Age, 'DateCreated'),
            this.Language,
            this.addDateFilter(this.Played, 'LastPlayedDate'),
            this.Ratings,
            this.Resolution,
            this.Size,
            this.Type,
            this.Year,
            this.Audio,
            this.Video,
            this.View,
        ].map(cd => new Column(cd, this.embyComponent));
    }

    protected Select = {
        key: 'Selected',
        width: '20px',
        active: true,
        sortDir: false,
        filter: null
    }

    // noinspection JSUnusedGlobalSymbols
    protected Name = {
        key: 'Name',
        active: true,
        sortDir: 1,
        filter: {
            type: 'text',
            filterArgs: [null],
            filter(items: EmbyMediaModel[], value: any): EmbyMediaModel[] {
                return items.filter(item => item.SortName.indexOf(value) !== -1);
            },
            prepare: (value: any): string => value.toLowerCase(),
        }
    };

    // noinspection JSUnusedGlobalSymbols
    protected Size = {
        key: 'Size',
        active: true,
        sortDir: 0,
        output: v => {
            return new FileSizePipe().transform(v);
        },
        filter: {
            type: 'select',
            switchValues: ['gt', 'lt'],
            filterArgs: [null, 'gt'],
            prepare: (value: any): number => parseInt(value) * 1000000000,
            filter(items: EmbyMediaModel[], value: any, filterArgs: any[]): EmbyMediaModel[] {
                return items.filter(item => filterArgs[1] === 'gt' ? item.Size > value : item.Size < value);
            },
            options: [
                {value: '', label: ''},
                {value: '5', label: '5 GB'},
                {value: '10', label: '10 GB'},
                {value: '20', label: '20 GB'},
                {value: '50', label: '50 GB'},
            ],
        }
    };

    // noinspection JSUnusedGlobalSymbols
    protected Type = {
        key: 'Type',
        active: false,
        sortDir: 0,
        filter: {
            type: 'select',
            filter(items: EmbyMediaModel[], value: any) {
                return items.filter(item => item.Type === value);
            },
            options: [
                {value: '', label: ''},
                {value: EmbyMediaType.Movie, label:EmbyMediaType.Movie},
                {value: EmbyMediaType.Series, label: EmbyMediaType.Series},
                {value: EmbyMediaType.Episode, label: EmbyMediaType.Episode},
            ],
        }
    };

    // noinspection JSUnusedGlobalSymbols
    protected Year = {
        key: 'ProductionYear',
        label: 'Year',
        sortDir: 0,
        filter: {
            type: 'text',
            filterArgs: [null, 'gt'],
            switchValues: ['gt', 'lt'],
            prepare(value: any): any {
                value = value.trim();
                if (/^\d{2}$/.test(value)) {
                    value = '20' + value;
                }
                return parseInt(value);
            },
            filter(items: EmbyMediaModel[], value: any, filterArgs: any[]): EmbyMediaModel[] {
                return items.filter(item => filterArgs[1] === 'gt' ? item.ProductionYear > value : item.ProductionYear < value);
            }
        }
    };

    // noinspection JSUnusedGlobalSymbols
    protected Age = {
        key: 'DateCreated',
        label: 'Age',
        sortDir: 0,
        output: v => new AgePipe().transform(v, '', true),
        filter: {}
    };

    // noinspection JSUnusedGlobalSymbols
    protected Played = {
        key: 'LastPlayedDate',
        label: 'Last Played',
        active: true,
        sortDir: 0,
        output: v => new AgePipe().transform(v, '', true),
        filter: {}

    };

    // noinspection JSUnusedGlobalSymbols
    protected View = {
        key: 'PlayedPercent',
        label: 'View',
        active: true,
        sortDir: 0,
        output: v => typeof v === 'number' && v > 0 ? v.toString() + '%' : '-',
        filter: {
            type: 'select',
            switchValues: ['gt', 'lt'],
            filterArgs: [null, 'gt'],
            options: [
                {value: '', label: ''},
                {value: '25', label: '25%'},
                {value: '50', label: '50%'},
                {value: '75', label: '75%'},
            ],
            prepare: (value: any): number => parseInt(value),
            filter(items: EmbyMediaModel[], value: any, filterArgs: any[]): EmbyMediaModel[] {
                return items.filter(item => filterArgs[1] === 'gt' ? item.PlayedPercent > value : item.PlayedPercent < value);
            }
        }
    };

    // noinspection JSUnusedGlobalSymbols
    protected Ratings = {
        key: 'CommunityRating',
        label: 'Ratings',
        sortDir: 0,
        filter: {
            type: 'select',
            switchValues: ['gt', 'lt'],
            filterArgs: [null, 'gt'],
            options: [
                {value: '', label: ''},
                {value: '3', label: '3'},
                {value: '5', label: '5'},
                {value: '6', label: '6'},
                {value: '7', label: '7'},
                {value: '8', label: '8'},
                {value: '9', label: '9'},
                {value: '10', label: '10'},
            ],
            prepare: (value: any): number => parseInt(value),
            filter(items: EmbyMediaModel[], value: any, filterArgs: any[]): EmbyMediaModel[] {
                return items.filter(item => filterArgs[1] === 'gt' ? item.CommunityRating > value : item.CommunityRating < value);
            }
        }
    };

    // noinspection JSUnusedGlobalSymbols
    protected Audio = {
        key: 'AudioCodec',
        label: 'Audio',
        output: v => v.join(', '),
        filter: {
            type: 'select',
            options: [],
            prepare: (value: any): any => value,
            filter(items: EmbyMediaModel[], value: any): EmbyMediaModel[] {
                return value ? items.filter(item => item.hasAudioCodec(value)) : items;
            }
        }
    };

    // noinspection JSUnusedGlobalSymbols
    protected Video = {
        key: 'VideoCodec',
        label: 'Video',
        output: v => v.join(', '),
        filter: {
            type: 'select',
            options: [],
            prepare: (value: any): any => value,
            filter(items: EmbyMediaModel[], value: any): EmbyMediaModel[] {
                return value ? items.filter(item => item.hasVideoCodec(value)) : items;
            }
        }
    };

    // noinspection JSUnusedGlobalSymbols
    protected Resolution = {
        key: 'Resolution',
        label: 'Resolution',
        output: (v, item: EmbyMediaModel) => item.getResolution().map(v => [v.class, ' (', v.res, ')'].join('')).join(', '),
        filter: {
            type: 'select',
            options: [],
            prepare: (value: any): any => value,
            filter(items: EmbyMediaModel[], value: any): EmbyMediaModel[] {
                console.log(value);
                return value ? items.filter(item => item.hasVideoResolution(value)) : items;
            }
        }
    };

    // noinspection JSUnusedGlobalSymbols
    protected Language = {
        key: 'Language',
        label: 'Language',
        output: (v, item: EmbyMediaModel) => {
            return item.getLanguage().join(', ');
        },
        filter: {
            type: 'select',
            options: [],
            filterArgs: [null, '='],
            switchValues: ['=', '≠'],
            prepare: (value: any): any => value,
            filter(items: EmbyMediaModel[], value: any, filterArgs: any[]): EmbyMediaModel[] {
                return items.filter(item => filterArgs[1] === '=' ? item.hasLanguage(value) : !item.hasLanguage(value));
            }
        }
    };


    protected addDateFilter(columnData: { filter: {} }, itemKey) {
        columnData.filter = {
            type: 'select',
            switchValues: ['gt', 'lt'],
            filterArgs: [null, 'gt'],
            prepare(value: any): any {
                value = value.split(' ');
                value[0] = parseInt(value[0]);
                const date = new Date();
                switch (value[1]) {
                    case 'y':
                        date.setFullYear(date.getFullYear() - value[0]);
                        break;
                    case 'm':
                        date.setTime(date.getTime() - value[0] * 30 * 86400 * 1000);
                        break;
                }
                return date;
            },
            filter(items: EmbyMediaModel[], value: any, filterArgs: any[]): EmbyMediaModel[] {
                return items.filter(item => filterArgs[1] === 'gt' ?
                    item[itemKey].getTime() < value : item[itemKey].getTime() > value);
            },
            options: [
                {value: '', label: ''},
                {value: '3 m', label: '3 Month'},
                {value: '6 m', label: '6 Month'},
                {value: '1 y', label: '1 Year'},
                {value: '2 y', label: '2 Year'},
            ],
        };
        return columnData;
    }

}
