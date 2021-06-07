import BaseDataProxy from "BaseDataProxy";
/**
 * 本地数据代理
 */
export default abstract class LocalStorageDataProxy<Data extends object> extends BaseDataProxy<Data> {
    /** 是否使用数据代理工具 */
    protected ifUseObjectProxyT: boolean;
    /** 保存名字 */
    private m_saveName;
    /** 获取保存名称，重写覆盖，默认获取类名 */
    protected get _saveName(): string;
    /** 初始化 */
    constructor();
    protected _init(): void;
    protected _initData(): Data;
    /** 数据变化回调 */
    private dataChange;
    /** 保存次数 */
    private m_saveNumber;
    /**
     * 保存数据
     * @param _ifCurrent 是否限流，如果为true的话则每次宏任务只会执行一次
     */
    save(_ifCurrent?: boolean): void;
    /** 保存数据 */
    private _save;
    /** 获取本地数据 */
    private getLocalStorageData;
    /**
     * 加密
     * 重写覆盖，默认返回的原字符串
     * @param _str 需要加密的字符串
     */
    protected _encrypt(_str: string): string;
    /**
     * 解密
     * 重写覆盖，默认返回原字符串
     * @param _str 加密的字符串
     */
    protected _decode(_str: string): string;
}
