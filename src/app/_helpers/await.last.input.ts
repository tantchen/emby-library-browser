export class AwaitLastInput {

    protected timeout: number;

    protected promise: PromiseLike<any>;

    protected timeoutId: any;

    constructor(timeout: number) {
        this.timeout = timeout;
    }

    public input() {
        return new Promise(resolve => {
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }
            this.timeoutId = setTimeout(() => {
                return resolve();
            }, this.timeout)
        })
    }

}