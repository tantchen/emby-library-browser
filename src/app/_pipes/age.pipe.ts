// @ts-ignore
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'age'})
export class AgePipe implements PipeTransform {
    transform(date: Date, forceUse: string='',addLabel: boolean=false): string {
        if(!date || !(date instanceof Date) || !date.getTime()){
            return '-';
        }
        const diffS = (new Date().getTime() - date.getTime()) / 1000;
        let u = '';
        let v = 0;
        const map = [
            {l: '', t: 1},
            {l: 'sec', t: 1},
            {l: 'min', t: 60},
            {l: 'h', t: 60 * 60},
            {l: 'd', t: 60 * 60 * 24},
            {l: 'w', t: 60 * 60 * 24 * 7},
            {l: 'M', t: 60 * 60 * 24 * 30},
            {l: 'Y', t: 60 * 60 * 24 * 365},
        ];
        map.every((m, i) => {
            const last = map[i - 1];
            const next = map[i + 1];
            if (!last) {
                return true;
            }
            if (diffS < m.t || !next || m.l === forceUse) {
                u = last.l;
                v = Math.round(diffS / last.t);
                return false;
            }
            return true;
        });
        if(!addLabel){
            return v.toString();
        }
        return [v.toString(),u].join(' ');
    }
}
// @ts-ignore
