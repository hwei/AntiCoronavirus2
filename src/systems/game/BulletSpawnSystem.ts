import { ComponentSystem, World, Translation, PostCreateEntitySystem, DeleteAtTickComponent, ITimeInfo, EmptyComponentRawArray } from "entities-ts";
import { LineMoveComponent } from "../move/LineMoveSystem";
import { Object3dPool, IVector3 } from "../../engine/Object3d";
import { Script3dObject } from "../../engine/Script3dObject";
import { Object3dComponent } from "../commmon/Object3dSystem";

export class BulletTag {
    static readonly instance = new BulletTag();
    static createRawArray(capacity: number) {
        return new EmptyComponentRawArray(capacity, BulletTag.instance);
    }
}

const bulletSpeed = 5;
const bulletLifeTime = 5;
const shootTickInterval = 2;

export class BulletSpawnSystem extends ComponentSystem {
    private _velocity = new Laya.Vector3();
    private _pool: Object3dPool<Script3dObject>;

    constructor(pool: Object3dPool<Script3dObject>) {
        super();
        this._pool = pool;
    }

    public setShootDirection(direction: Laya.Vector3) {
        Laya.Vector3.normalize(direction, this._velocity);
        Laya.Vector3.scale(this._velocity, bulletSpeed, this._velocity);
    }

    createUpdateFuction(world: World) {
        const postCreateEntitySystem = world.getSystem(PostCreateEntitySystem);

        const bulletArchetype = world.entityManager.getArchetype(
            BulletTag, LineMoveComponent, Translation, Object3dComponent, DeleteAtTickComponent);

        let nextShootTick: number | undefined;

        const logicUpdate = (timeInfo: ITimeInfo) => {
            if(nextShootTick === undefined) {
                nextShootTick = timeInfo.tick + shootTickInterval;
                return;
            }

            if(timeInfo.tick <= nextShootTick) {
                return;
            }

            nextShootTick += shootTickInterval;

            const lineMoveComponent = new LineMoveComponent()
            .assignOrigin({ y: -0.2 })
            .assignVelocity(this._velocity)
            .assignBeginTick(timeInfo.tick);

            const object3dComponent = new Object3dComponent(this._pool.spawn());
            const lifeTickCount = Math.floor(bulletLifeTime / timeInfo.tickInterval);
            const deleteAtTickComponent = new DeleteAtTickComponent(timeInfo.tick + lifeTickCount);
            
            postCreateEntitySystem.enqueue(bulletArchetype, lineMoveComponent, object3dComponent, deleteAtTickComponent);
        }

        return { logicUpdate }
    }
}
