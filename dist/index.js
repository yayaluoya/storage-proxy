(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global['storage-proxy'] = factory());
}(this, (function () { 'use strict';

    /**
     * 基类数据
     */
    class BaseData {
    }

    /**
     * 对象代理类
     */
    class ObjectProxy {
    }

    /**
     * 仓库数据代理
     */
    class StorageDataProxy {
        /** 初始化 */
        constructor() { }
    }

    /**
     * 仓库代理
     */
    var Main = {
        /** 基类数据 */
        BaseData,
        /** 对象代理类 */
        ObjectProxy,
        /** 仓库数据代理 */
        StorageDataProxy,
    };

    return Main;

})));
