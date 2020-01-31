import { ComponentSystem, World, Translation, PostDeleteEntitySystem } from "entities-ts";
import { VirusTag } from "./VirusSpawnSystem";
import { BulletTag } from "./BulletSpawnSystem";


const collideDist2 = 0.2 * 0.2;

export class CollideSystem extends ComponentSystem {
    createUpdateFuction(world: World) {
        const { entityManager } = world;
        const virusQuery = entityManager.getQuery({
            include: [ VirusTag, Translation ],
        });
        const bulletQuery = entityManager.getQuery({
            include: [ BulletTag, Translation ],
        });
        const postDeleteEntitySystem = world.getSystem(PostDeleteEntitySystem);

        function logicUpdate() {
            if(virusQuery.isEmptyIgnoreFilter() || bulletQuery.isEmptyIgnoreFilter()) {
                return;
            }

            for(const virusChunk of virusQuery.iterChunks()) {
                const virusEntityArray = virusChunk.getEntityArray();
                const virusTranslationArray = virusChunk.getDataArray(Translation);
                if(virusTranslationArray === null)
                    throw new Error();
                
                for(const bulletChunk of bulletQuery.iterChunks()) {
                    const bulletEntityArray = bulletChunk.getEntityArray();
                    const bulletTranslationArray = bulletChunk.getDataArray(Translation);
                    if(bulletTranslationArray === null)
                        throw new Error();

                    for(let vi = 0; vi < virusChunk.count; ++vi) {
                        const virusPos = virusTranslationArray.get(vi);
                        for(let bi = 0; bi < bulletChunk.count; ++bi) {
                            const bulletPos = bulletTranslationArray.get(bi);

                            const dx = virusPos.x - bulletPos.x;
                            const dy = virusPos.y - bulletPos.y;
                            const dz = virusPos.z - bulletPos.z;

                            const d2 = dx * dx + dy * dy + dz * dz;
                            if(d2 <= collideDist2) {
                                postDeleteEntitySystem.enqueue(virusEntityArray.get(vi));
                                postDeleteEntitySystem.enqueue(bulletEntityArray.get(bi));
                            }
                        }
                    }


                }
            }
        }

        return { logicUpdate };
    }
}