import LocalStorageDataProxy from "LocalStorageDataProxy";
/**
 * 数据模板
 */
declare class Data__ {
    number: number;
    boolean: boolean;
    string: string;
    object: object;
    array: any[];
}
/**
 * 测试数据
 */
export default class TestLSData extends LocalStorageDataProxy<Data__> {
    protected dataTemplate: {
        new (): Data__;
    };
    addMonitor(): void;
}
export {};
