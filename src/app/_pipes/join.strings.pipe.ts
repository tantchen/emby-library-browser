import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'joinStrings'})
export class JoinStringsPipe implements PipeTransform {
    transform(variable: string[],glue: string=', '): string {
        return variable.join(glue);
    }
}