/**
 * 本地数据版本管理工具
 */
export default class LSDataVMT {
    /** 数据名字 */
    private static m_name;
    /**
     * 获取版本
     * @param _name 数据名字
     * @param _dV 默认值
     */
    static getV(_name: string, _dV: () => IDataV): IDataV;
    /**
     * 设置版本
     * @param _name 数据名字
     * @param _v 版本信息
     */
    static setV(_name: string, _v: IDataV): void;
    /**
     * 对比版本信息
     * @param _a a版本信息
     * @param _b b版本信息
     */
    static contrastV(_a: IDataV, _b: IDataV): boolean;
    /** 获取一份混淆字符串 */
    static getConfuse(): string;
    /** 获取本地数据 */
    private static getData;
    /** 保存数据 */
    private static saveData;
}
/**
 * 数据版本接口
 */
export interface IDataV {
    /** 版本号 */
    code: number;
    /** 混淆值 */
    confuse: string;
}
