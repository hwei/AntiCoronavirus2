import { World, ComponentSystem, PostCreateEntitySystem, PostDeleteEntitySystem, PostRemoveComponentSystem, DeleteAtTickSystem } from "entities-ts"
import { LineMoveSystem } from "./systems/move/LineMoveSystem";
import { VirusSpawnSystem } from "./systems/game/VirusSpawnSystem";
import { Object3dPool, IVector3 } from "./engine/Object3d";
import { Script3dObject } from "./engine/Script3dObject";
import { Object3dSystem } from "./systems/commmon/Object3dSystem";
import { BulletSpawnSystem } from "./systems/game/BulletSpawnSystem";
import { CollideSystem } from "./systems/game/CollideSystem";


export function createGame(scene3d: Laya.Scene3D, virusPrefab: Laya.Sprite3D, bulletPrefab: Laya.Sprite3D) {

    const virusPool = new Object3dPool<Script3dObject>(() => new Script3dObject(virusPrefab, scene3d));
    const bulletPool = new Object3dPool<Script3dObject>(() => new Script3dObject(bulletPrefab, scene3d));

    const bulletSpawnSystem = new BulletSpawnSystem(bulletPool);

    const systems = new Array<ComponentSystem>();
    systems.push(
        new VirusSpawnSystem(virusPool),
        bulletSpawnSystem,

        new LineMoveSystem(),

        new CollideSystem(),

        new DeleteAtTickSystem(),
        new PostRemoveComponentSystem(),
        new PostCreateEntitySystem(),
        new PostDeleteEntitySystem(),

        new Object3dSystem(),
    )

    const world = new World(systems);

    return {
        update(time: number) {
            world.update(time);
        },
        setShootDirection(direction: Laya.Vector3) {
            bulletSpawnSystem.setShootDirection(direction);
        },
    }
}

