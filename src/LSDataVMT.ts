/**
 * 本地数据版本管理工具
 */
export default class LSDataVMT {
    /** 数据名字 */
    private static m_name: string = btoa('LSDataVMT');

    /**
     * 获取版本
     * @param _name 数据名字
     * @param _dV 默认值
     */
    public static getV(_name: string, _dV: () => IDataV): IDataV {
        let _data = this.getData();
        //如果不存在的话就保存一个副本
        if (!_data[_name]) {
            _data[_name] = _dV();
            this.saveData(_data);
        }
        return _data[_name];
    }

    /**
     * 设置版本
     * @param _name 数据名字
     * @param _v 版本信息
     */
    public static setV(_name: string, _v: IDataV) {
        let _data = this.getData();
        _data[_name] = _v;
        this.saveData(_data);
    }

    /**
     * 对比版本信息
     * @param _a a版本信息
     * @param _b b版本信息
     */
    public static contrastV(_a: IDataV, _b: IDataV): boolean {
        return _a.code == _b.code && _a.confuse == _b.confuse;
    }

    /** 获取一份混淆字符串 */
    public static getConfuse(): string {
        return '';
    }

    /** 获取本地数据 */
    private static getData(): object {
        let _data: object;
        let _dataStr: string = localStorage.getItem(this.m_name);
        if (_dataStr) {
            try {
                _data = JSON.parse(atob(_dataStr));
            } catch (e) {
                _data = {};
            }
        } else {
            _data = {};
        }
        return _data;
    }
    /** 保存数据 */
    private static saveData(_data: any) {
        //保存
        localStorage.setItem(this.m_name, btoa(JSON.stringify(_data)));
    }
}

/**
 * 数据版本接口
 */
export interface IDataV {
    /** 版本号 */
    code: number,
    /** 混淆值 */
    confuse: string,
}