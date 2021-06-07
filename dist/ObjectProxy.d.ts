/**
 * 对象代理类
 */
export default class ObjectProxy {
    /** 代理对象 */
    private m_object;
    /** 监听列表 */
    private m_monitorList;
    /** 反应列表 */
    private m_reactionList;
    /** 是否在收集依赖 */
    private m_ifDollectionDependItem;
    /** 依赖收集列表 */
    private m_dependItemCollectionList;
    /** 获取代理对象 */
    get object(): object;
    /**
     * 被代理的对象
     * @param _object 源对象
     */
    constructor(_object: object);
    /**
     * 添加监听
     * 当被代理的对象被设置后会执行添加的这些监听
     * @param _this 执行域
     * @param _f 执行方法
     * @param _object 依赖对象，不填则依赖全部内容
     * @param _key 依赖该对象的键，不填则依赖全部键
     */
    addMonitor<O extends object, keys extends keyof O>(_this: any, _f: IProxySetF<void>, _object?: O, _key?: keys | keys[]): void;
    /**
     * 删除监听
     * @param _this 执行域
     * @param _f 执行方法，如果不设置的话则删除该执行域下的全部监听
     */
    removeMonitor(_this: any, _f?: IProxySetF<void>): void;
    /**
     * 添加反应
     * 当目标执行方法中依赖到的监听数据发生变化时会自动执行这个方法
     * ! 执行方法在这里会被执行一次用以收集依赖
     * ! 注意不要在执行方法里面设置依赖的数据，不然会导致无限递归。
     * @param _this 执行域
     * @param _f 执行方法
     */
    addReaction(_this: any, _f: Function): void;
    /**
     * 删除反应
     * @param _this 执行域
     * @param _f 执行方法
     */
    remoteReaction(_this: any, _f?: Function): void;
    /**
     * 开始收集依赖
     */
    startCollectionDependItem(): void;
    /**
     * 结束收集依赖
     * 会把收集到的依赖输出到传入的数组参数里面
     * @param _dependItems 依赖输出数组
     */
    stopCollectionDependItem(_dependItems: IDependItem[]): void;
    /**
     * 获取代理对象
     * @param _object 目标对象
     */
    private getProxy;
    /** 配合获取代理对象，深度优先获取 */
    private _getProxy;
    /**
     * 设置回调
     * @param target 源对象
     * @param p 键
     * @param value 值
     * @param receiver 代理对象
     */
    private set_;
    /**
     * 获取回调
     * @param target 源对象
     * @param p 键
     * @param receiver 代理对象
     */
    private get_;
}
/**
 * 代理设置方法接口
 */
interface IProxySetF<Return> {
    (target: any, p: string | symbol, value: any, _value: any, receiver: any): Return;
}
/**
 * 依赖
 */
interface IDependItem {
    /** 代理对象 */
    object: object;
    /** 键，不设置值的话这监听代理对象的全部内容 */
    keys?: string | symbol | string[] | symbol[];
}
export {};
