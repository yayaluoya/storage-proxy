import ObjectProxy from "ObjectProxy";

/**
 * 基类数据代理
 */
export default abstract class BaseDataProxy<Data extends object> {
    /** 数据 */
    private m_data: Data;
    /** 对象代理工具 */
    private m_objectProxyT: ObjectProxy;
    /** 是否使用数据代理工具 */
    protected ifUseObjectProxyT: boolean = false;
    /** 数据模板 */
    protected abstract dataTemplate: { new(): Data };

    /** 获取数据 */
    public get data(): Data {
        return this.m_data;
    }
    /** 获取数据代理工具 */
    public get objectProxyT(): ObjectProxy {
        return this.m_objectProxyT;
    }

    /** 初始化 */
    public init() {
        //判断是否要使用数据代理工具
        if (this.ifUseObjectProxyT) {
            //创建对象代理工具
            this.m_objectProxyT = new ObjectProxy(this._initData());
            //获取数据
            this.m_data = this.m_objectProxyT.object as Data;
        } else {
            this.m_data = this._initData();
        }
        //
        this._init();
    }

    /** 初始化后的回调 */
    protected _init() { }

    /** 获取初始化数据 */
    protected _initData(): Data {
        return this._newData();
    }

    /**
     * 获取一份新数据
     * 重写覆盖
     */
    protected _newData(): Data {
        //直接返回一个模板实例化的数据
        return new this.dataTemplate();
    }
}