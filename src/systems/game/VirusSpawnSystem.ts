import { ComponentSystem, World, Translation, PostCreateEntitySystem, DeleteAtTickComponent, ITimeInfo, EmptyComponentRawArray } from "entities-ts";
import { LineMoveComponent } from "../move/LineMoveSystem";
import * as MathUtility from "../../MathUtility";
import { Random, MersenneTwister19937 } from "random-js";
import { Object3dPool } from "../../engine/Object3d";
import { Script3dObject } from "../../engine/Script3dObject";
import { Object3dComponent } from "../commmon/Object3dSystem";

export class VirusTag {
    static readonly instance = new VirusTag();
    static createRawArray(capacity: number) {
        return new EmptyComponentRawArray(capacity, VirusTag.instance);
    }
}

export class VirusSpawnSystem extends ComponentSystem {
    private _pool: Object3dPool<Script3dObject>;

    constructor(pool: Object3dPool<Script3dObject>) {
        super();
        this._pool = pool;
    }

    createUpdateFuction(world: World) {
        const postCreateEntitySystem = world.getSystem(PostCreateEntitySystem);
        const random = new Random(MersenneTwister19937.autoSeed());
        const averageInterval = 0.1;

        const virusArchetype = world.entityManager.getArchetype(
            VirusTag, LineMoveComponent, Translation, Object3dComponent, DeleteAtTickComponent);

        const genNextSpawnTime = () => MathUtility.poissonNextTime(random.realZeroToOneExclusive()) * averageInterval;

        let nextSpawnTime = genNextSpawnTime();

        const speed = 1;

        const logicUpdate = (timeInfo: ITimeInfo) => {
            if(timeInfo.tickTime < nextSpawnTime)
                return;
            nextSpawnTime += genNextSpawnTime();

            const p = MathUtility.randomPointInCircle(
                random.realZeroToOneExclusive(),
                random.realZeroToOneExclusive(),
                random.realZeroToOneExclusive()
            )

            const origin = new Laya.Vector3(p.x * 16, p.y * 4, -20);
            const velocity = new Laya.Vector3();
            Laya.Vector3.normalize(origin, velocity);
            Laya.Vector3.scale(velocity, -speed, velocity);
            
            const lineMoveComponent = new LineMoveComponent()
            .assignOrigin(origin)
            .assignVelocity(velocity)
            .assignBeginTick(timeInfo.tick);

            const object3dComponent = new Object3dComponent(this._pool.spawn());
            const dist = Laya.Vector3.scalarLength(origin);
            const t = (dist - 0.5) / speed;
            const lifeTickCount = Math.floor(t / timeInfo.tickInterval);
            const deleteAtTickComponent = new DeleteAtTickComponent(timeInfo.tick + lifeTickCount);
            
            postCreateEntitySystem.enqueue(virusArchetype, lineMoveComponent, object3dComponent, deleteAtTickComponent);
        }

        return { logicUpdate }
    }
}
