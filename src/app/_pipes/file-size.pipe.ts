import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'fileSize'})
export class FileSizePipe implements PipeTransform {
    transform(bytes: number): string {
        if (!bytes) {
            return '0 B';
        }
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return ((bytes / Math.pow(1024, i)).toFixed(2))
            + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }
}
