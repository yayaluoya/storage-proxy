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
            console.log('根数据发生变化');
        }, this.data);
        this.objectProxyT.addMonitor(this, () => {
            console.log('number数据发生变化');
        }, this.data, 'number');
        this.objectProxyT.addMonitor(this, () => {
            console.log('boolean数据发生变化');
        }, this.data, 'boolean');
        this.objectProxyT.addMonitor(this, () => {
            console.log('string数据发生变化');
        }, this.data, 'string');
        this.objectProxyT.addMonitor(this, () => {
            console.log('对象发生变化');
        }, this.data.object);
        this.objectProxyT.addMonitor(this, () => {
            console.log('对象属性a发生变化');
        }, this.data.object, 'a' as any);
        this.objectProxyT.addMonitor(this, () => {
            console.log('数组发生变化');
        }, this.data.array);
    }
}

let _data = new TestLSData()
_data.init();
_data.addMonitor();

_data.data.number++;
window['dataTest'] = _data;
console.log(_data);