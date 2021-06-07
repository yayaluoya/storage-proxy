import BaseDataProxy from "BaseDataProxy";

/**
 * 本地数据代理
 */
export default abstract class LocalStorageDataProxy<Data extends object> extends BaseDataProxy<Data> {
    /** 是否使用数据代理工具 */
    protected ifUseObjectProxyT: boolean = true;
    /** 保存名字 */
    private m_saveName: string;
    /** 获取保存名称，重写覆盖，默认获取类名 */
    protected get _saveName(): string {
        return this.constructor.name;
    }

    /** 初始化 */
    public constructor() {
        super();
        //
        this.m_saveName = btoa(this._saveName);
    }

    //
    protected _init() {
        //添加数据改动监听
        this.objectProxyT.addMonitor(this, this.dataChange);
    }

    //重写父类的_initData方法
    protected _initData(): Data {
        return this.getLocalStorageData();
    }

    /** 数据变化回调 */
    private dataChange() {
        this.save();
    }

    /** 保存次数 */
    private m_saveNumber: number = 0;
    /**
     * 保存数据
     * @param _ifCurrent 是否限流，如果为true的话则每次宏任务只会执行一次
     */
    public save(_ifCurrent: boolean = true) {
        if (_ifCurrent) {
            this.m_saveNumber++;
            Promise.resolve().then(() => {
                this.m_saveNumber--;
                if (this.m_saveNumber == 0) {
                    this._save(this.data);
                }
            });
        } else {
            this._save(this.data);
        }
    }
    /** 保存数据 */
    private _save(_data: Data) {
        localStorage.setItem(this.m_saveName, this._encrypt(JSON.stringify(_data)));
    }
    /** 获取本地数据 */
    private getLocalStorageData(): Data {
        let _data: Data = this._newData();
        let __data: Data;
        //如果没有数据的话直接保存一份
        try {
            let _dataStr: string = localStorage.getItem(this.m_saveName);
            if (!_dataStr) { throw null; }
            __data = JSON.parse(this._decode(_dataStr));
        }
        catch (e) {
            this._save(_data);
        }
        if (__data) {
            //根据定义的数据来获取本地的数据
            for (let i in _data) {
                _data[i] = __data[i];
            }
        }
        //
        return _data;
    }

    /**
     * 加密
     * 重写覆盖，默认返回的原字符串
     * @param _str 需要加密的字符串
     */
    protected _encrypt(_str: string): string {
        return _str;
    }
    /**
     * 解密
     * 重写覆盖，默认返回原字符串
     * @param _str 加密的字符串
     */
    protected _decode(_str: string): string {
        return _str;
    }
}