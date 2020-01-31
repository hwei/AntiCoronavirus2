import { ComponentSystem, World, AliveTag, Translation, ITimeInfo, PostRemoveComponentSystem, ObjectComponentRawArray } from "entities-ts";
import { Object3d } from "../../engine/Object3d";

export class Object3dComponent {
    static readonly isSystemState = true;

    private _object3d: Object3d | null;

    constructor(object3d: Object3d | null = null) {
        this._object3d = object3d;
    }

    get object3d() {
        if(this._object3d === null)
            throw new Error();
        return this._object3d;
    }

    private static _empty: Object3dComponent | null = null;

    static createRawArray(capacity: number) {
        let empty = Object3dComponent._empty;
        if(empty === null) {
            empty = new Object3dComponent(null);
            Object3dComponent._empty = empty;
        }
        return new ObjectComponentRawArray<Object3dComponent>(capacity, empty);
    }
}

export class Object3dSystem extends ComponentSystem {
    createUpdateFuction(world: World) {
        const { entityManager } = world;
        const deletedQuery = entityManager.getQuery({
            include: [Object3dComponent],
            exclude: [AliveTag],
        });
        const moveQuery = entityManager.getQuery({
            include: [Object3dComponent, Translation, AliveTag],
        });
        const postRemoveComponentSystem = world.getSystem(PostRemoveComponentSystem);

        function logicUpdate(timeInfo: ITimeInfo) {
            if(!deletedQuery.isEmptyIgnoreFilter())
            {
                for(const chunk of deletedQuery.iterChunks()) {
                    const entityArray = chunk.getEntityArray();
                    const object3dDataArray = chunk.getDataArray(Object3dComponent);
                    if(object3dDataArray === null)
                        throw new Error();
                    for(const e of entityArray) {
                        postRemoveComponentSystem.enqueue(e, Object3dComponent);
                    }
                    for(let i = 0; i < chunk.count; ++i) {
                        const object3dData = object3dDataArray.get(i);
                        object3dData.object3d.recycle();
                    }
                }
            }
        }
        function presentUpdate(timeInfo: ITimeInfo) {
            if(!moveQuery.isEmptyIgnoreFilter()) {
                for(const chunk of moveQuery.iterChunks()) {
                    const object3dDataArray = chunk.getDataArray(Object3dComponent);
                    const translationArray = chunk.getDataArray(Translation);
                    if(object3dDataArray === null)
                        throw new Error();
                    if(translationArray === null)
                        throw new Error();
                    for(let i = 0; i < chunk.count; ++i) {
                        const pos = translationArray.get(i);
                        // console.log(pos.x, pos.y, pos.z);
                        object3dDataArray.get(i).object3d.setPosition(pos);
                    }
                }
            }
        }

        return { logicUpdate, presentUpdate };
    }
}