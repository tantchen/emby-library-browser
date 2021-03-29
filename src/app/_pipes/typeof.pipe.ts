import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'typeOf'})
export class TypeOfPipe implements PipeTransform {
    transform(variable: any,test: string=''): boolean {
        return typeof variable === test;
    }
}