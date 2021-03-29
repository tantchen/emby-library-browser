export class MultiSorter {


    public sort<T>(array: T[], sortObject: any): T[] {
        sortObject = MultiSorter.prepareParams(sortObject);
        const sortKeys = Object.keys(sortObject);
        // Return array if no sort object is supplied.
        if (!sortKeys.length) {
            return array;
        }

        // Change the values of the sortObject keys to -1, 0, or 1.
        for (let key in sortObject) {
            if (!sortObject.hasOwnProperty(key)) {
                continue;
            }
            sortObject[key] = sortObject[key] === -1 ? -1 : (sortObject[key] === 0 ? 0 : 1);
        }
        const keySort = (a, b, direction) => {
            direction = direction !== null ? direction : 1;

            if (a === b) { // If the values are the same, do not switch positions.
                return 0;
            }

            // If b > a, multiply by -1 to get the reverse direction.
            return a > b ? direction : -1 * direction;
        };

        return array.sort((a, b) => {
            let sorted = 0;
            let index = 0;

            // Loop until sorted (-1 or 1) or until the sort keys have been processed.
            while (sorted === 0 && index < sortKeys.length) {
                const key = sortKeys[index];

                if (key) {
                    const direction = sortObject[key];

                    sorted = keySort(a[key], b[key], direction);
                    index++;
                }
            }

            return sorted;
        });
    }

    private static prepareParams(params: any): object {
        const sorters = {};
        if (typeof params === 'object') {
            Object.keys(params).forEach(key => {
                if (!/^[a-z_-]+$/gi.test(key)) {
                    return;
                }
                if (typeof params[key] === 'string' && /^(asc|desc|1|-1)$/gi.test(params[key])) {
                    sorters[key] = params[key];
                } else if (typeof params[key] === 'number' && [1, -1].includes(params[key])) {
                    sorters[key] = params[key];
                }
            });
        }
        Object.keys(sorters).forEach(key => {
            if(typeof sorters[key] !== 'string'){
                return;
            }
            if (['asc', '1'].includes(sorters[key].toLowerCase())) {
                sorters[key] = 1;
            } else if (['desc', '-1'].includes(sorters[key].toLowerCase())) {
                sorters[key] = -1;
            }
        });
        return sorters;
    }
}