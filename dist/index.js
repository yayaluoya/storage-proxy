(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global['storage-proxy'] = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /**
     * 对象代理类
     */
    var ObjectProxy = /** @class */ (function () {
        /**
         * 被代理的对象
         * @param _object 源对象
         */
        function ObjectProxy(_object) {
            /** 监听列表 */
            this.m_monitorList = [];
            /** 反应列表 */
            this.m_reactionList = [];
            /** 是否在收集依赖 */
            this.m_ifDollectionDependItem = false;
            /** 依赖收集列表 */
            this.m_dependItemCollectionList = [];
            //获取代理对象
            this.m_object = this.getProxy(_object);
        }
        Object.defineProperty(ObjectProxy.prototype, "object", {
            /** 获取代理对象 */
            get: function () {
                return this.m_object;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * 添加监听
         * 当被代理的对象被设置后会执行添加的这些监听
         * @param _this 执行域
         * @param _f 执行方法
         * @param _object 依赖对象，不填则依赖全部内容
         * @param _key 依赖该对象的键，不填则依赖全部键
         */
        ObjectProxy.prototype.addMonitor = function (_this, _f, _object, _key) {
            var _dependItem;
            if (_object || _key) {
                _dependItem = {
                    object: _object,
                    keys: _key,
                };
            }
            //添加到监听列表
            this.m_monitorList.push({
                this: _this,
                f: _f,
                dependItem: _dependItem,
            });
        };
        /**
         * 删除监听
         * @param _this 执行域
         * @param _f 执行方法，如果不设置的话则删除该执行域下的全部监听
         */
        ObjectProxy.prototype.removeMonitor = function (_this, _f) {
            this.m_monitorList = this.m_monitorList.filter(function (item) {
                return !(item.this == _this && (_f ? item.f == _f : true));
            });
        };
        /**
         * 添加反应
         * 当目标执行方法中依赖到的监听数据发生变化时会自动执行这个方法
         * ! 执行方法在这里会被执行一次用以收集依赖
         * ! 注意不要在执行方法里面设置依赖的数据，不然会导致无限递归。
         * @param _this 执行域
         * @param _f 执行方法
         */
        ObjectProxy.prototype.addReaction = function (_this, _f) {
            //开始收集依赖
            this.startCollectionDependItem();
            _f.call(_this);
            var _dependItems = [];
            //输出收集的依赖
            this.stopCollectionDependItem(_dependItems);
            this.m_reactionList.push({
                this: _this,
                f: _f,
                dependItems: _dependItems,
            });
        };
        /**
         * 删除反应
         * @param _this 执行域
         * @param _f 执行方法
         */
        ObjectProxy.prototype.remoteReaction = function (_this, _f) {
            this.m_reactionList = this.m_reactionList.filter(function (item) {
                return !(item.this == _this && (_f ? item.f == _f : true));
            });
        };
        /**
         * 开始收集依赖
         */
        ObjectProxy.prototype.startCollectionDependItem = function () {
            this.m_ifDollectionDependItem = true;
            this.m_dependItemCollectionList.length = 0;
        };
        /**
         * 结束收集依赖
         * 会把收集到的依赖输出到传入的数组参数里面
         * @param _dependItems 依赖输出数组
         */
        ObjectProxy.prototype.stopCollectionDependItem = function (_dependItems) {
            this.m_ifDollectionDependItem = false;
            _dependItems.push.apply(_dependItems, this.m_dependItemCollectionList);
            this.m_dependItemCollectionList.length = 0;
        };
        /**
         * 获取代理对象
         * @param _object 目标对象
         */
        ObjectProxy.prototype.getProxy = function (_object) {
            return this._getProxy(_object);
        };
        /** 配合获取代理对象，深度优先获取 */
        ObjectProxy.prototype._getProxy = function (_item) {
            var _this_1 = this;
            if (_item && typeof _item == 'object') {
                if (!Array.isArray(_item)) {
                    for (var _i in _item) {
                        _item[_i] = this._getProxy(_item[_i]);
                    }
                }
                return new Proxy(_item, {
                    set: function (target, p, value, receiver) {
                        var _a;
                        //调用回调
                        value = (_a = _this_1.set_(target, p, value, receiver)) !== null && _a !== void 0 ? _a : value;
                        //
                        return Reflect.set(target, p, value, receiver);
                    },
                    get: function (target, p, receiver) {
                        //调用回调
                        _this_1.get_(target, p, receiver);
                        //
                        return Reflect.get(target, p, receiver);
                    }
                });
            }
            return _item;
        };
        /**
         * 设置回调
         * @param target 源对象
         * @param p 键
         * @param value 值
         * @param receiver 代理对象
         */
        ObjectProxy.prototype.set_ = function (target, p, value, receiver) {
            //如果是数组的length属性变化的话则抛弃这次的回调
            if (Array.isArray(target) && p == 'length') {
                return;
            }
            //如果目标值是对象的话就获取它的代理
            if (value && typeof value == 'object') {
                value = this.getProxy(value);
            }
            //处理监听回调
            this.m_monitorList.forEach(function (item) {
                //如果有依赖的话就检查依赖
                if (item.dependItem) {
                    if (item.dependItem.object != receiver) {
                        return;
                    }
                    if (item.dependItem.keys) {
                        if (Array.isArray(item.dependItem.keys)) {
                            if (item.dependItem.keys.length > 0 && !item.dependItem.keys.includes(p)) {
                                return;
                            }
                        }
                        else {
                            if (item.dependItem.keys != p) {
                                return;
                            }
                        }
                    }
                }
                //绑定执行回调
                item.f.call(item.this, target, p, value, target[p], receiver);
            });
            //处理反应回调
            this.m_reactionList.forEach(function (item) {
                //检测是否有依赖
                if (item.dependItems.length > 0) {
                    for (var _a = 0, _b = item.dependItems; _a < _b.length; _a++) {
                        var o = _b[_a];
                        if (o.object != receiver && o.keys != p) {
                            //绑定执行回调
                            item.f.apply(item.this);
                        }
                    }
                }
            });
            //
            return value;
        };
        /**
         * 获取回调
         * @param target 源对象
         * @param p 键
         * @param receiver 代理对象
         */
        ObjectProxy.prototype.get_ = function (target, p, receiver) {
            //收集依赖
            if (this.m_ifDollectionDependItem) {
                //检测是是否有重复依赖
                if (this.m_dependItemCollectionList.findIndex(function (item) {
                    return item.object == receiver && item.keys == p;
                }) == -1) {
                    this.m_dependItemCollectionList.push({
                        object: receiver,
                        keys: p,
                    });
                }
            }
        };
        return ObjectProxy;
    }());

    /**
     * 基类数据代理
     */
    var BaseDataProxy = /** @class */ (function () {
        function BaseDataProxy() {
            /** 是否使用数据代理工具 */
            this.ifUseObjectProxyT = false;
        }
        Object.defineProperty(BaseDataProxy.prototype, "data", {
            /** 获取数据 */
            get: function () {
                return this.m_data;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BaseDataProxy.prototype, "objectProxyT", {
            /** 获取数据代理工具 */
            get: function () {
                return this.m_objectProxyT;
            },
            enumerable: false,
            configurable: true
        });
        /** 初始化 */
        BaseDataProxy.prototype.init = function () {
            //判断是否要使用数据代理工具
            if (this.ifUseObjectProxyT) {
                //创建对象代理工具
                this.m_objectProxyT = new ObjectProxy(this._initData());
                //获取数据
                this.m_data = this.m_objectProxyT.object;
            }
            else {
                this.m_data = this._initData();
            }
            //
            this._init();
        };
        /** 初始化后的回调 */
        BaseDataProxy.prototype._init = function () { };
        /** 获取初始化数据 */
        BaseDataProxy.prototype._initData = function () {
            return this._newData();
        };
        /**
         * 获取一份新数据
         * 重写覆盖
         */
        BaseDataProxy.prototype._newData = function () {
            //直接返回一个模板实例化的数据
            return new this.dataTemplate();
        };
        return BaseDataProxy;
    }());

    /**
     * 运行时数据代理
     */
    var RuntimeDataProxy = /** @class */ (function (_super) {
        __extends(RuntimeDataProxy, _super);
        function RuntimeDataProxy() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return RuntimeDataProxy;
    }(BaseDataProxy));

    /**
     * 本地数据版本管理工具
     */
    var LSDataVMT = /** @class */ (function () {
        function LSDataVMT() {
        }
        /**
         * 获取版本
         * @param _name 数据名字
         * @param _dV 默认值
         */
        LSDataVMT.getV = function (_name, _dV) {
            var _data = this.getData();
            //如果不存在的话就保存一个副本
            if (!_data[_name]) {
                _data[_name] = _dV();
                this.saveData(_data);
            }
            return _data[_name];
        };
        /**
         * 设置版本
         * @param _name 数据名字
         * @param _v 版本信息
         */
        LSDataVMT.setV = function (_name, _v) {
            var _data = this.getData();
            _data[_name] = _v;
            this.saveData(_data);
        };
        /**
         * 对比版本信息
         * @param _a a版本信息
         * @param _b b版本信息
         */
        LSDataVMT.contrastV = function (_a, _b) {
            return _a.code == _b.code && _a.confuse == _b.confuse;
        };
        /** 获取一份混淆字符串 */
        LSDataVMT.getConfuse = function () {
            return '';
        };
        /** 获取本地数据 */
        LSDataVMT.getData = function () {
            var _data;
            var _dataStr = localStorage.getItem(this.m_name);
            if (_dataStr) {
                try {
                    _data = JSON.parse(atob(_dataStr));
                }
                catch (e) {
                    _data = {};
                }
            }
            else {
                _data = {};
            }
            return _data;
        };
        /** 保存数据 */
        LSDataVMT.saveData = function (_data) {
            //保存
            localStorage.setItem(this.m_name, btoa(JSON.stringify(_data)));
        };
        /** 数据名字 */
        LSDataVMT.m_name = btoa('LSDataVMT');
        return LSDataVMT;
    }());

    /**
     * 本地数据代理
     */
    var LocalStorageDataProxy = /** @class */ (function (_super) {
        __extends(LocalStorageDataProxy, _super);
        /** 初始化 */
        function LocalStorageDataProxy() {
            var _this = _super.call(this) || this;
            /** 是否使用数据代理工具 */
            _this.ifUseObjectProxyT = true;
            /** 数据变化次数 */
            _this.m_dataChangeNumber = 0;
            //
            _this.m_saveName = btoa(_this._saveName);
            //获取版本
            _this.m_versions = LSDataVMT.getV(_this.m_saveName, function () {
                return {
                    code: 1,
                    confuse: LSDataVMT.getConfuse(),
                };
            });
            return _this;
        }
        Object.defineProperty(LocalStorageDataProxy.prototype, "_saveName", {
            /** 获取保存名称，重写覆盖，默认获取类名 */
            get: function () {
                return this.constructor.name;
            },
            enumerable: false,
            configurable: true
        });
        //
        LocalStorageDataProxy.prototype._init = function () {
            var _this = this;
            //添加数据改动监听
            this.objectProxyT.addMonitor(this, this.dataChange);
            //添加一个更新方法
            var _f = function () {
                //执行更新方法
                _this.update();
                //
                requestAnimationFrame(_f);
            };
            _f();
        };
        //重写父类的_initData方法
        LocalStorageDataProxy.prototype._initData = function () {
            return this.getLocalStorageData();
        };
        /** 数据变化回调 */
        LocalStorageDataProxy.prototype.dataChange = function () {
            this.m_dataChangeNumber++;
        };
        /** 每帧更新 */
        LocalStorageDataProxy.prototype.update = function () {
            //执行回调
            this._update();
            //
            var _ifSaveData = this.m_dataChangeNumber > 0;
            this.m_dataChangeNumber = 0;
            //同步数据
            this.syncData();
            //保存数据
            if (_ifSaveData) {
                this._saveData(this.data);
            }
        };
        /**
         * 保存数据
         * * 当数据必须立即保存时调用
         */
        LocalStorageDataProxy.prototype.saveData = function () {
            this._saveData(this.data);
        };
        /** 保存数据 */
        LocalStorageDataProxy.prototype._saveData = function (_data) {
            // console.log('保存数据');
            localStorage.setItem(this.m_saveName, this._encrypt(JSON.stringify(_data)));
            //更新版本，累加版本号，获取一个随机的混淆字符串
            this.m_versions.code++;
            this.m_versions.confuse = LSDataVMT.getConfuse();
            LSDataVMT.setV(this.m_saveName, this.m_versions);
        };
        /** 同步数据 */
        LocalStorageDataProxy.prototype.syncData = function () {
            var _this = this;
            var _v = LSDataVMT.getV(this.m_saveName, function () {
                return _this.m_versions;
            });
            //判断版本
            if (!LSDataVMT.contrastV(this.m_versions, _v)) {
                //同步版本
                this.m_versions = _v;
                //同步数据
                var _data = JSON.parse(this._decode(localStorage.getItem(this.m_saveName)));
                this._syncData(this.data, _data);
            }
        };
        /** 配合遍历同步数据 */
        LocalStorageDataProxy.prototype._syncData = function (a, b) {
            // console.log('同步数据', a, b);
            var _anchor = a;
            var _aKey = [];
            var _bKey = [];
            for (var i in a) {
                _aKey.push(i);
            }
            for (var i in b) {
                _bKey.push(i);
            }
            if (_bKey.length > _aKey.length) {
                _anchor = b;
            }
            for (var i in _anchor) {
                if (a[i] && typeof a[i] == 'object') {
                    this._syncData(a[i], b[i]);
                }
                else {
                    if (a[i] != b[i]) {
                        a[i] = b[i];
                    }
                }
            }
        };
        /** 获取本地数据 */
        LocalStorageDataProxy.prototype.getLocalStorageData = function () {
            var _data = this._newData();
            var __data;
            //如果没有数据的话直接保存一份
            try {
                var _dataStr = localStorage.getItem(this.m_saveName);
                if (!_dataStr) {
                    throw null;
                }
                __data = JSON.parse(this._decode(_dataStr));
            }
            catch (e) {
                this._saveData(_data);
            }
            if (__data) {
                //根据定义的数据来获取本地的数据
                for (var i in _data) {
                    _data[i] = __data[i];
                }
            }
            //
            return _data;
        };
        /**
         * 加密
         * 重写覆盖，默认使用base64
         * @param _str 需要加密的字符串
         */
        LocalStorageDataProxy.prototype._encrypt = function (_str) {
            return btoa(_str);
        };
        /**
         * 解密
         * 重写覆盖，默认使用base64
         * @param _str 加密的字符串
         */
        LocalStorageDataProxy.prototype._decode = function (_str) {
            return atob(_str);
        };
        /** 每帧更新回调 */
        LocalStorageDataProxy.prototype._update = function () { };
        return LocalStorageDataProxy;
    }(BaseDataProxy));

    /**
     * 数据模板
     */
    var Data__ = /** @class */ (function () {
        function Data__() {
            this.number = 10;
            this.boolean = true;
            this.string = 'string';
            this.object = {
                a: 10,
                b: 'b',
                c: true,
            };
            this.array = [1, true, 'c', { a: 1 }, [1]];
        }
        return Data__;
    }());
    /**
     * 测试数据
     */
    var TestLSData = /** @class */ (function (_super) {
        __extends(TestLSData, _super);
        function TestLSData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.dataTemplate = Data__;
            return _this;
        }
        //
        TestLSData.prototype.addMonitor = function () {
            this.objectProxyT.addMonitor(this, function () {
                console.log('根数据发生变化');
            }, this.data);
            this.objectProxyT.addMonitor(this, function () {
                console.log('number数据发生变化');
            }, this.data, 'number');
            this.objectProxyT.addMonitor(this, function () {
                console.log('boolean数据发生变化');
            }, this.data, 'boolean');
            this.objectProxyT.addMonitor(this, function () {
                console.log('string数据发生变化');
            }, this.data, 'string');
            this.objectProxyT.addMonitor(this, function () {
                console.log('对象发生变化');
            }, this.data.object);
            this.objectProxyT.addMonitor(this, function () {
                console.log('对象属性a发生变化');
            }, this.data.object, 'a');
            this.objectProxyT.addMonitor(this, function () {
                console.log('数组发生变化');
            }, this.data.array);
        };
        return TestLSData;
    }(LocalStorageDataProxy));
    var _data = new TestLSData();
    _data.init();
    _data.addMonitor();
    _data.data.number++;
    window['dataTest'] = _data;
    console.log(_data);

    /**
     * 仓库代理
     */
    var Main = {
        /** 仓库数据代理 */
        LocalStorageDataProxy: LocalStorageDataProxy,
        /** 运行时数据代理，不需要保存到本地的数据 */
        RuntimeDataProxy: RuntimeDataProxy,
    };

    return Main;

})));
