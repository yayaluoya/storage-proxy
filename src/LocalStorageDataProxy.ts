import BaseDataProxy from "BaseDataProxy";
import LSDataVMT, { IDataV } from "LSDataVMT";

/**
 * 本地数据代理
 */
export default abstract class LocalStorageDataProxy<Data extends object> extends BaseDataProxy<Data> {
    /** 版本 */
    private m_versions: IDataV;
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
        //获取版本
        this.m_versions = LSDataVMT.getV(this.m_saveName, () => {
            return {
                code: 1,
                confuse: LSDataVMT.getConfuse(),
            }
        });
    }

    //
    protected _init() {
        //添加数据改动监听
        this.objectProxyT.addMonitor(this, this.dataChange);
        //添加一个更新方法
        let _f = () => {
            //执行更新方法
            this.update();
            //
            requestAnimationFrame(_f);
        };
        _f();
    }

    //重写父类的_initData方法
    protected _initData(): Data {
        return this.getLocalStorageData();
    }

    /** 数据变化次数 */
    private m_dataChangeNumber: number = 0;
    /** 数据变化回调 */
    private dataChange() {
        this.m_dataChangeNumber++;
    }

    /** 每帧更新 */
    private update() {
        //执行回调
        this._update();
        //
        let _ifSaveData: boolean = this.m_dataChangeNumber > 0;
        this.m_dataChangeNumber = 0;
        //同步数据
        this.syncData();
        //保存数据
        if (_ifSaveData) {
            this._saveData(this.data);
        }
    }

    /**
     * 保存数据
     * * 当数据必须立即保存时调用
     */
    public saveData() {
        this._saveData(this.data);
    }
    /** 保存数据 */
    private _saveData(_data: Data) {
        // console.log('保存数据');
        localStorage.setItem(this.m_saveName, this._encrypt(JSON.stringify(_data)));
        //更新版本，累加版本号，获取一个随机的混淆字符串
        this.m_versions.code++;
        this.m_versions.confuse = LSDataVMT.getConfuse();
        LSDataVMT.setV(this.m_saveName, this.m_versions);
    }
    /** 同步数据 */
    private syncData() {
        let _v: IDataV = LSDataVMT.getV(this.m_saveName, () => {
            return this.m_versions;
        });
        //判断版本
        if (!LSDataVMT.contrastV(this.m_versions, _v)) {
            //同步版本
            this.m_versions = _v;
            //同步数据
            let _data: Data = JSON.parse(this._decode(localStorage.getItem(this.m_saveName)));
            this._syncData(this.data, _data);
        }
    }
    /** 配合遍历同步数据 */
    private _syncData(a: object, b: object) {
        // console.log('同步数据', a, b);
        let _anchor: object = a;
        let _aKey: string[] = [];
        let _bKey: string[] = [];
        for (let i in a) {
            _aKey.push(i);
        }
        for (let i in b) {
            _bKey.push(i);
        }
        if (_bKey.length > _aKey.length) {
            _anchor = b;
        }
        for (let i in _anchor) {
            if (a[i] && typeof a[i] == 'object') {
                this._syncData(a[i], b[i]);
            } else {
                if (a[i] != b[i]) {
                    a[i] = b[i];
                }
            }
        }
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
            this._saveData(_data);
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
     * 重写覆盖，默认使用base64
     * @param _str 需要加密的字符串
     */
    protected _encrypt(_str: string): string {
        return btoa(_str);
    }
    /**
     * 解密
     * 重写覆盖，默认使用base64
     * @param _str 加密的字符串
     */
    protected _decode(_str: string): string {
        return atob(_str);
    }
    /** 每帧更新回调 */
    protected _update() { }
}