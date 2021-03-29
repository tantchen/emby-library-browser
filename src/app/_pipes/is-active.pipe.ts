import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'isActive'})
export class IsActivePipe implements PipeTransform {
    transform<T>(variable: T[], key: string): T[] {
        return variable.filter(v => {
            return Array.isArray(v[key]) ? !!v[key].length : !!v[key];
        });
    }
}