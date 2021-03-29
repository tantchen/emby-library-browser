import {Pipe, PipeTransform} from '@angular/core';
import {Column, EmbyLibraryModel, EmbyMediaModel} from '@app/_models';

@Pipe({name: 'chunk'})
export class ChunkPipe implements PipeTransform {
    transform(variable: EmbyLibraryModel[], size: (number|number[])): EmbyLibraryModel[][];
    transform(variable: EmbyMediaModel[], size: (number|number[])): EmbyMediaModel[][];
    transform(variable: Column[], size: (number|number[])): Column[][];
    transform(variable: {}[], size: (number|number[])): {}[][];
    transform(variable: any[], size: (number|number[])): any[][] {
        let array = Array.from(variable);
        let results = [];
        let loop = 0;
        let chunkSize = typeof size === 'number' ? size : size[0];
        while (array.length) {
            if(Array.isArray(size) && size[loop]){
                chunkSize = size[loop];
            }
            results.push(array.splice(0, chunkSize));
            loop++;
        }
        return results;
    }
}