import {Pipe, PipeTransform} from '@angular/core';
import {MultiSorter} from '../_helpers';

@Pipe({name: 'sortObjectCollection'})
export class SortObjectCollectionPipe implements PipeTransform {
    transform<T>(collection: T[], sortKey: string, sortDir: number, clone: boolean = true): T[] {
        if (clone) {
            collection = Array.from(collection);
        }
        let sortObject = {};
        sortObject[sortKey] = sortDir;
        return new MultiSorter().sort<T>(collection,sortObject)
    }
}
