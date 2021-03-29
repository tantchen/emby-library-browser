import {EmbyMediaModel, EmbyMediaType} from '@app/_models/emby/emby.media.model';
import {EmbyLibraryModel} from '@app/_models/emby/emby.library.model';
import {MultiSorter} from '@app/_helpers/multi.sort';

export class EmbyHelpers {
    public static generatePaginationOptions(mediaItems: EmbyMediaModel[], templateData: {pages: number,page: number,limit: number,pagination: string[]}) {
        const currentPage = templateData.page;
        const pageCount = Math.ceil(mediaItems.length / templateData.limit);
        const delta = 2;
        const range = [];
        templateData.pages = pageCount;
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(pageCount - 1, currentPage + delta); i++) {
            range.push(i);
        }
        if (currentPage - delta > 2) {
            range.unshift('...');
        }
        if (currentPage + delta < pageCount - 1) {
            range.push('...');
        }

        range.unshift(1);
        range.push(pageCount);
        templateData.pagination = range;
        return this;
    }

    public static sortItems(mediaItems: EmbyMediaModel[], sortObject = {}) {
        sortObject = Object.assign({}, sortObject);
        if (Object(sortObject).hasOwnProperty('DateCreated')) {
            // @ts-ignore
            sortObject.DateCreated *= -1;
        }
        if (!Object.keys(sortObject).length) {
            // @ts-ignore
            sortObject.Id = 1;
        }
        new MultiSorter().sort(mediaItems, sortObject);
    }

    public static collectDuplicateItems(mediaItems: EmbyMediaModel[]){
        const duplicateByKey = {};
        const duplicates = [];
        mediaItems.filter(m => m.Type === EmbyMediaType.Movie).forEach(m => {
            let k = m.Name.toLowerCase();
            duplicateByKey[k] = duplicateByKey[k] || {name: m.Name, items: []};
            duplicateByKey[k].items.push(m);
        });
        mediaItems.filter(m => m.Type === EmbyMediaType.Episode).forEach(m => {
            let k = [m.SeriesName, m.SeasonName, m.Name].join(' / ');
            duplicateByKey[k] = duplicateByKey[k] || {name: m.Name, items: []};
            duplicateByKey[k].items.push(m);
        });
        Object.keys(duplicateByKey).forEach(k => {
            if (duplicateByKey[k].items.length > 1) {
                duplicates.push(...duplicateByKey[k].items);
            }
        });
        return duplicates;
    }

    public static prepareItems(items: EmbyMediaModel[], libraries: EmbyLibraryModel[]): EmbyMediaModel[] {
        const episodes = items.filter(item => item.Type === EmbyMediaType.Episode);
        const seasons = items.filter(item => item.Type === EmbyMediaType.Season);
        let series = items.filter(item => item.Type === EmbyMediaType.Series);
        episodes.forEach(e => {
            seasons.forEach(s => s.registerEpisode(e));
            series.forEach(s => s.registerEpisode(e));
        });
        seasons.forEach(se => {
            series.forEach(s => s.registerSeason(se));
        });
        const seriesByName = {};
        series.forEach(s => {
            if (seriesByName[s.Name]) {
                seriesByName[s.Name].Seasons.push(...s.Seasons);
                seriesByName[s.Name].Episodes.push(...s.Episodes);
                items.splice(items.indexOf(s), 1);
                return;
            }
            seriesByName[s.Name] = s;
        });
        series = items.filter(item => item.Type === EmbyMediaType.Series);
        series.forEach(s => s.calculateSize());
        seasons.forEach(s => s.calculateSize());
        items = items.filter(item => [EmbyMediaType.Series, EmbyMediaType.Movie].includes(item.Type));
        items.forEach(item => {
            item.registerLibrary(libraries);
            item.analiseMediaStreams();
        });
        return items;
    }

    public static getOptionsFromMediaItems(mediaItems: EmbyMediaModel[], key: string, addEmpty: boolean = true) {
        let values = {};
        let options = [];
        mediaItems.forEach(m => {
            if (Array.isArray(m[key])) {
                if (key === 'Resolution') {
                    return m[key].forEach((v: { class: string, label: string, width: number }) => values[v.class] = v.width);
                }
                m[key].forEach((v: string) => values[v] = v);
            }
        });
        const sortedOptions = [];
        Object.keys(values).forEach(v => sortedOptions.push({label: v, value: values[v]}));
        new MultiSorter().sort(sortedOptions, {value: 1});
        options.push(...sortedOptions.map(o => {
            return {label: o.label, value: o.label};
        }));
        if (addEmpty) {
            options.unshift({value: '', label: ''});
        }
        return options;
    }
}