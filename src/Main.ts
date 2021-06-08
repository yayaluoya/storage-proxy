import RuntimeDataProxy from "RuntimeDataProxy";
import LocalStorageDataProxy from "./LocalStorageDataProxy";
import "./TestLSData";

/**
 * 仓库代理
 */
export default {
    /** 仓库数据代理 */
    LocalStorageDataProxy,
    /** 运行时数据代理，不需要保存到本地的数据 */
    RuntimeDataProxy,
};