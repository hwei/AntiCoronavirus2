export interface IVector3 {
    x: number,
    y: number,
    z: number,
}

export abstract class Object3d {
    private _poolArray: Array<Object3d> | null = null;
    private _recycled = false;

    abstract setPosition(position: IVector3): void;
    abstract setEnable(enabled: boolean): void;

    get recycled() {
        return this._recycled;
    }

    recycle() {
        if(this._recycled)
            return;
        this.setEnable(false);
        if(this._poolArray === null)
            throw new Error();
        this._poolArray.push(this);
        this._recycled = true;
    }

    static Pool = class Object3dPool <T extends Object3d> {
        private _pool = new Array<T>();
        private _createFunc: (name: string) => T;
    
        constructor(createFunc: (name: string) => T) {
            this._createFunc = createFunc;
        }
    
        spawn(name = '') {
            let o: T | undefined;
            if(this._pool.length > 0) {
                o = <T>this._pool.pop();
                o.setEnable(true);
            } else {
                o = this._createFunc(name);
                o._poolArray = this._pool;
            }
            o._recycled = false;
            return o;
        }
    }
}

export class Object3dPool<T extends Object3d> extends Object3d.Pool<T> {
}
