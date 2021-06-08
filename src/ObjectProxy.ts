/**
 * 对象代理类
 */
export default class ObjectProxy {
    /** 代理对象 */
    private m_object: object;
    /** 监听列表 */
    private m_monitorList: {
        /** 执行域 */
        this: any,
        /** 执行方法 */
        f: IProxySetF<void>,
        /** 依赖 */
        dependItem: IDependItem,
    }[] = [];
    /** 反应列表 */
    private m_reactionList: {
        /** 执行域 */
        this: any,
        /** 执行方法 */
        f: Function,
        /** 依赖列表 */
        dependItems: IDependItem[],
    }[] = [];
    /** 是否在收集依赖 */
    private m_ifDollectionDependItem: boolean = false;
    /** 依赖收集列表 */
    private m_dependItemCollectionList: IDependItem[] = [];

    /** 获取代理对象 */
    public get object(): object {
        return this.m_object;
    }

    /**
     * 被代理的对象
     * @param _object 源对象
     */
    public constructor(_object: object) {
        //获取代理对象
        this.m_object = this.getProxy(_object);
    }

    /**
     * 添加监听
     * 当被代理的对象被设置后会执行添加的这些监听
     * @param _this 执行域
     * @param _f 执行方法
     * @param _object 依赖对象，不填则依赖全部内容
     * @param _key 依赖该对象的键，不填则依赖全部键
     */
    public addMonitor<O extends object, keys extends keyof O>(_this: any, _f: IProxySetF<void>, _object?: O, _key?: keys | keys[]) {
        let _dependItem: IDependItem;
        if (_object || _key) {
            _dependItem = {
                object: _object,
                keys: _key as any,
            };
        }
        //添加到监听列表
        this.m_monitorList.push({
            this: _this,
            f: _f,
            dependItem: _dependItem,
        });
    }
    /**
     * 删除监听
     * @param _this 执行域
     * @param _f 执行方法，如果不设置的话则删除该执行域下的全部监听
     */
    public removeMonitor(_this: any, _f?: IProxySetF<void>) {
        this.m_monitorList = this.m_monitorList.filter((item) => {
            return !(item.this == _this && (_f ? item.f == _f : true));
        });
    }

    /**
     * 添加反应
     * 当目标执行方法中依赖到的监听数据发生变化时会自动执行这个方法
     * ! 执行方法在这里会被执行一次用以收集依赖
     * ! 注意不要在执行方法里面设置依赖的数据，不然会导致无限递归。
     * @param _this 执行域
     * @param _f 执行方法
     */
    public addReaction(_this: any, _f: Function) {
        //开始收集依赖
        this.startCollectionDependItem();
        _f.call(_this);
        let _dependItems: IDependItem[] = [];
        //输出收集的依赖
        this.stopCollectionDependItem(_dependItems);
        this.m_reactionList.push({
            this: _this,
            f: _f,
            dependItems: _dependItems,
        });
    }
    /**
     * 删除反应
     * @param _this 执行域
     * @param _f 执行方法
     */
    public remoteReaction(_this: any, _f?: Function) {
        this.m_reactionList = this.m_reactionList.filter((item) => {
            return !(item.this == _this && (_f ? item.f == _f : true));
        });
    }

    /**
     * 开始收集依赖
     */
    public startCollectionDependItem() {
        this.m_ifDollectionDependItem = true;
        this.m_dependItemCollectionList.length = 0;
    }
    /**
     * 结束收集依赖
     * 会把收集到的依赖输出到传入的数组参数里面
     * @param _dependItems 依赖输出数组
     */
    public stopCollectionDependItem(_dependItems: IDependItem[]) {
        this.m_ifDollectionDependItem = false;
        _dependItems.push(...this.m_dependItemCollectionList);
        this.m_dependItemCollectionList.length = 0;
    }

    /**
     * 获取代理对象
     * @param _object 目标对象
     */
    private getProxy(_object: object): object {
        return this._getProxy(_object);
    }
    /** 配合获取代理对象，深度优先获取 */
    private _getProxy(_item: any): any {
        if (_item && typeof _item == 'object') {
            if (!Array.isArray(_item)) {
                for (let _i in _item) {
                    _item[_i] = this._getProxy(_item[_i]);
                }
            }
            return new Proxy(_item, {
                set: (target: any, p: string | symbol, value: any, receiver: any): boolean => {
                    //调用回调
                    value = this.set_(target, p, value, receiver) ?? value;
                    //
                    return Reflect.set(target, p, value, receiver);
                },
                get: (target: any, p: string | symbol, receiver: any): any => {
                    //调用回调
                    this.get_(target, p, receiver);
                    //
                    return Reflect.get(target, p, receiver);
                }
            });
        }
        return _item;
    }

    /**
     * 设置回调
     * @param target 源对象
     * @param p 键
     * @param value 值
     * @param receiver 代理对象
     */
    private set_(target: any, p: string | symbol, value: any, receiver: any): any {
        //如果是数组的length属性变化的话则抛弃这次的回调
        if (Array.isArray(target) && p == 'length') { return; }
        //如果目标值是对象的话就获取它的代理
        if (value && typeof value == 'object') {
            value = this.getProxy(value);
        }
        //处理监听回调
        this.m_monitorList.forEach((item) => {
            //如果有依赖的话就检查依赖
            if (item.dependItem) {
                if (item.dependItem.object != receiver) { return; }
                if (item.dependItem.keys) {
                    if (Array.isArray(item.dependItem.keys)) {
                        if (item.dependItem.keys.length > 0 && !(item.dependItem.keys as any[]).includes(p)) { return; }
                    } else {
                        if (item.dependItem.keys != p) { return; }
                    }
                }
            }
            //绑定执行回调
            item.f.call(item.this, target, p, value, target[p], receiver);
        });
        //处理反应回调
        this.m_reactionList.forEach((item) => {
            //检测是否有依赖
            if (item.dependItems.length > 0) {
                for (let o of item.dependItems) {
                    if (o.object != receiver && o.keys != p) {
                        //绑定执行回调
                        item.f.apply(item.this);
                    }
                }
            }
        });
        //
        return value;
    }
    /**
     * 获取回调
     * @param target 源对象
     * @param p 键
     * @param receiver 代理对象
     */
    private get_(target: any, p: string | symbol, receiver: any) {
        //收集依赖
        if (this.m_ifDollectionDependItem) {
            //检测是是否有重复依赖
            if (this.m_dependItemCollectionList.findIndex((item) => {
                return item.object == receiver && item.keys == p;
            }) == -1) {
                this.m_dependItemCollectionList.push({
                    object: receiver,
                    keys: p,
                });
            }
        }
    }
}

/**
 * 代理设置方法接口
 */
interface IProxySetF<Return> {
    (target: any, p: string | symbol, value: any, _value: any, receiver: any): Return;
}

/**
 * 依赖
 */
interface IDependItem {
    /** 代理对象 */
    object: object,
    /** 键，不设置值的话这监听代理对象的全部内容 */
    keys?: string | symbol | string[] | symbol[],
}