(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global['storage-proxy'] = factory());
}(this, (function () { 'use strict';

    /**
     * 基类数据
     */
    var BaseData = /** @class */ (function () {
        function BaseData() {
        }
        return BaseData;
    }());

    /**
     * 对象代理类
     */
    var ObjectProxy = /** @class */ (function () {
        function ObjectProxy() {
        }
        return ObjectProxy;
    }());

    /**
     * 仓库数据代理
     */
    var StorageDataProxy = /** @class */ (function () {
        /** 初始化 */
        function StorageDataProxy() {
        }
        return StorageDataProxy;
    }());

    /**
     * 仓库代理
     */
    var Main = {
        /** 基类数据 */
        BaseData: BaseData,
        /** 对象代理类 */
        ObjectProxy: ObjectProxy,
        /** 仓库数据代理 */
        StorageDataProxy: StorageDataProxy,
    };

    return Main;

})));
