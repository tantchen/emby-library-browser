import { HttpParams } from '@angular/common/http';

export default class HttpClientUtils {
    private static primitives: string[] = ['string', 'number', 'boolean', 'symbol', 'bigint'];

    private static isBuffer(obj: any): boolean {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        return !!(obj?.constructor?.isBuffer && obj.constructor.isBuffer(obj));
    }

    private static toKeyValuePairs(prefix: string, obj: any): any {
        if (obj === null) {
            obj = '';
        } else if (obj instanceof Date) {
            obj = obj.toISOString();
        }

        if (this.primitives.includes(typeof obj) || this.isBuffer(obj)) {
            return [{
                key: prefix,
                value: String(obj)
            }];
        }

        // skip undefined values
        if (typeof obj === 'undefined') {
            return [];
        }

        const keys = Object.keys(obj);
        const pairs = keys.map((key) => {
            const keyPrefix = prefix + `[${key}]`;
            return this.toKeyValuePairs(keyPrefix, obj[key]);
        });

        // [[pair], [pair], [pair]] => [pair, pair, pair]
        return pairs.reduce((accumulator, value) => accumulator.concat(value), []);
    }

    static toHttpParams(obj: object): HttpParams {
        const keys = Object.keys(obj);
        const pairs = [];

        for (const key of keys) {
            const keyPairs = this.toKeyValuePairs(key, obj[key]);
            pairs.push(...keyPairs);
        }
        return pairs.reduce((params, pair) => params.append(pair.key, pair.value), new HttpParams());
    }
}