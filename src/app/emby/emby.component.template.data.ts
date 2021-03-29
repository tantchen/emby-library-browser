import {Column, EmbyMediaModel} from '../_models';

export class EmbyComponentTemplateData {
    public getData(): {
        page: number,
        pages: number,
        limit: number,
        resultMode: number,
        filterCollapse: boolean,
        trashCollapse: boolean,
        manageColumnsToggle: boolean,
        selectedUserCount: number,
        pagination: any[],
        mediaItems: EmbyMediaModel[],
        columns: Column[],
        activeColumns: Column[],
        columnsByKey: {[key: string]: Column},
        filters: { main: Column, others: Column[] },
    }{
        return {
            page: 1,
            pages: 0,
            limit: 10,
            resultMode: 0,
            selectedUserCount: 0,
            filterCollapse: true,
            trashCollapse: true,
            manageColumnsToggle: false,
            pagination: [],
            mediaItems: [],
            columns: [],
            activeColumns: [],
            columnsByKey: {},
            filters: {main: null, others: []},
        }
    }
}