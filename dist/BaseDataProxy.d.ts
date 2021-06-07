import ObjectProxy from "ObjectProxy";
/**
 * 基类数据代理
 */
export default abstract class BaseDataProxy<Data extends object> {
    /** 数据 */
    private m_data;
    /** 对象代理工具 */
    private m_objectProxyT;
    /** 是否使用数据代理工具 */
    protected ifUseObjectProxyT: boolean;
    /** 数据模板 */
    protected abstract dataTemplate: {
        new (): Data;
    };
    /** 获取数据 */
    get data(): Data;
    /** 获取数据代理工具 */
    get objectProxyT(): ObjectProxy;
    /** 初始化 */
    init(): void;
    /** 初始化后的回调 */
    protected _init(): void;
    /** 获取初始化数据 */
    protected _initData(): Data;
    /**
     * 获取一份新数据
     * 重写覆盖
     */
    protected _newData(): Data;
}
