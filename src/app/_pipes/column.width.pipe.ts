import {Pipe, PipeTransform} from '@angular/core';
import {Column} from '@app/_models';

@Pipe({name: 'columnWidth'})
export class ColumnWidthPipe implements PipeTransform {
    private column: Column;
    private nameColumn: Column;
    private activeColumns: Column[];
    private columnsCount: number;
    private logOutput: boolean=false;
    private config = {
        default: {min: 3, max: 10},
        Name: {min: 35},
        Selected: {px: 25}
    };

    transform(column: Column, activeColumns: Column[]): string {
        this.column = column;
        this.activeColumns = activeColumns;
        this.columnsCount = activeColumns.length - 2;
        this.nameColumn = activeColumns.find(c => c.key === 'Name');
        const config = {
            default: {min: 3, max: 10},
            Name: {min: 35},
            Selected: {px: 25}
        };
        if (column.key === 'Selected') {
            return this.output(config.Selected.px, 'px');
        }
        if (column.key === 'Name') {
            return this.output(this.getNameColumnsWidth(), '%');
        }
        return this.output(this.getDefaultColumnsWidth() / this.columnsCount, '%');
    }

    private getDefaultColumnsWidth(): number {
        if (!this.nameColumn) {
            return 100 / this.activeColumns.length;
        }
        let maxWidth = 100 - this.config.Name.min;
        maxWidth = Math.min(maxWidth, this.config.default.max * this.columnsCount);
        const minWidth = this.config.default.min * this.columnsCount;
        return Math.max(minWidth, maxWidth);
    }

    private getNameColumnsWidth(): number {
        if (!this.nameColumn) {
            return 0;
        }
        return Math.max(this.config.Name.min, 100 - this.getDefaultColumnsWidth());
    }

    private output(width: number, unit: string = '%'): string {
        if(this.logOutput){
            console.info(this.column.key, Math.round(width).toString() + unit);
        }
        return Math.round(width).toString() + unit;
    }

}