import LocalStorageDataProxy from "LocalStorageDataProxy";

/**
 * 数据模板
 */
class Data__ {
    number: number = 10;
    boolean: boolean = true;
    string: string = 'string';
    object: object = {
        a: 10,
        b: 'b',
        c: true,
    };
    array: any[] = [1, true, 'c', { a: 1 }, [1]];
}

/**
 * 测试数据
 */
export default class TestLSData extends LocalStorageDataProxy<Data__> {
    protected dataTemplate: { new(): Data__ } = Data__;

    //
    public addMonitor() {
        this.objectProxyT.addMonitor(this, () => {
            console.log('数组被设置');
        }, this.data, 'array');
        this.objectProxyT.addMonitor(this, () => {
            console.log('数组发生变化');
        }, this.data.array);
    }
}

let _data = new TestLSData()
_data.init();

_data.data.number++;

console.log(_data);
window['dataTest'] = _data;