import { Object3d, IVector3 } from "./Object3d";

export class Script3dObject extends Object3d {
    private _scene3d: Laya.Scene3D;
    private _sprite3d: Laya.Sprite3D;

    constructor(prefab: Laya.Sprite3D, scene3d: Laya.Scene3D) {
        super();

        this._scene3d = scene3d;
        this._sprite3d = Laya.Sprite3D.instantiate(prefab, scene3d);
    }

    setEnable(enabled: boolean): void {
        if(enabled)
            this._scene3d.addChild(this._sprite3d);
        else
            this._sprite3d.removeSelf();
    }
    setPosition({x, y, z}: IVector3): void {
        this._sprite3d.transform.position = new Laya.Vector3(x, y, z);
    }
}
