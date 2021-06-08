import BaseDataProxy from "BaseDataProxy";
/**
 * 本地数据代理
 */
export default abstract class LocalStorageDataProxy<Data extends object> extends BaseDataProxy<Data> {
    /** 版本 */
    private m_versions;
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
    /** 数据变化次数 */
    private m_dataChangeNumber;
    /** 数据变化回调 */
    private dataChange;
    /** 每帧更新 */
    private update;
    /**
     * 保存数据
     * * 当数据必须立即保存时调用
     */
    saveData(): void;
    /** 保存数据 */
    private _saveData;
    /** 同步数据 */
    private syncData;
    /** 配合遍历同步数据 */
    private _syncData;
    /** 获取本地数据 */
    private getLocalStorageData;
    /**
     * 加密
     * 重写覆盖，默认使用base64
     * @param _str 需要加密的字符串
     */
    protected _encrypt(_str: string): string;
    /**
     * 解密
     * 重写覆盖，默认使用base64
     * @param _str 加密的字符串
     */
    protected _decode(_str: string): string;
    /** 每帧更新回调 */
    protected _update(): void;
}
