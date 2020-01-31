import { StructDefine, ComponentSystem, World, Translation, ITimeInfo } from "entities-ts";

export class LineMoveComponent {
    beginTick = 0;
    originX = 0;
    originY = 0;
    originZ = 0;
    velocityX = 0;
    velocityY = 0;
    velocityZ = 0;

    assignOrigin({x = 0, y = 0, z = 0}) {
        this.originX = x;
        this.originY = y;
        this.originZ = z;
        return this;
    }

    assignVelocity({x = 0, y = 0, z = 0}) {
        this.velocityX = x;
        this.velocityY = y;
        this.velocityZ = z;
        return this;
    }

    assignBeginTick(tick: number) {
        this.beginTick = tick;
        return this;
    }

    calculatePosition(tick: number, tickInterval: number, fragTime = 0) {
        if(tick <= this.beginTick) {
            return {
                x: this.originX,
                y: this.originY,
                z: this.originZ,
            }
        }
        const t = (tick - this.beginTick) * tickInterval + fragTime;
        return {
            x: this.originX + this.velocityX * t,
            y: this.originY + this.velocityY * t,
            z: this.originZ + this.velocityZ * t,
        }
    }

    private static structDefine = new StructDefine<LineMoveComponent>({
        read(buffer) {
            const v = new LineMoveComponent();
            v.beginTick = buffer.readInt32();
            [v.originX, v.originY, v.originZ, v.velocityX, v.velocityY, v.velocityZ] = buffer.readMultipleFloat32(6);
            return v;
        },
        write(buffer, v) {
            buffer.writeInt32(v.beginTick);
            buffer.writeMultipleFloat32(v.originX, v.originY, v.originZ, v.velocityX, v.velocityY, v.velocityZ);
        },
        reset(buffer) {
            buffer.writeInt32(0);
            buffer.writeMultipleFloat32(0, 0, 0, 0, 0, 0);
        },
    });
    static createRawArray(capacity: number) {
        return LineMoveComponent.structDefine.createComponentRawArray(capacity);
    }
}

export class LineMoveSystem extends ComponentSystem {
    createUpdateFuction(world: World) {
        const { entityManager } = world;
        const query = entityManager.getQuery({
            include: [LineMoveComponent, Translation]
        });

        const update = (timeInfo: ITimeInfo) => {
            const { tick, tickInterval } = timeInfo;
            if(query.isEmptyIgnoreFilter())
                return;
            const fragTime = timeInfo.presentTime - timeInfo.tickTime;
            for(const chunk of query.iterChunks()) {
                const lineMoveDataArray = chunk.getDataArray(LineMoveComponent);
                if(lineMoveDataArray === null)
                    throw new Error();
                const translationArray = chunk.getDataArray(Translation);
                if(translationArray === null)
                    throw new Error();
 
                for(let i = 0; i < chunk.count; ++i) {
                    const lineMoveData = lineMoveDataArray.get(i);

                    if(tick <= lineMoveData.beginTick) {
                        translationArray.set(i, new Translation(lineMoveData.originX, lineMoveData.originY, lineMoveData.originZ));
                        continue;
                    }
                    const { x, y, z } = lineMoveData.calculatePosition(tick, tickInterval, fragTime);
                    translationArray.set(i, new Translation(x, y, z));
                }
            }
        }
        return { logicUpdate: update, presentUpdate: update };
    }
}
