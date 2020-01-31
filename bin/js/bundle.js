(function () {
    'use strict';

    class StructDefine {
        constructor(config) {
            this._read = config.read;
            this._write = config.write;
            this._reset = config.reset;
            const params = {
                int16Count: 0,
                int32Count: 0,
                float32Count: 0,
            };
            this._multiTypeBufferParams = params;
            this._reset({
                writeInt16: (_) => params.int16Count++,
                writeMultipleInt16: (...values) => params.int16Count += values.length,
                writeInt32: (_) => params.int32Count++,
                writeMultipleInt32: (...values) => params.int32Count += values.length,
                writeFloat32: (_) => params.float32Count++,
                writeMultipleFloat32: (...values) => params.float32Count += values.length,
            });
        }
        createComponentRawArray(capacity) {
            return new StructDefine.StructComponentRawArray(capacity, this);
        }
    }
    StructDefine.StructComponentRawArray = class {
        constructor(capacity, structDefine) {
            this._cursor = 0;
            this.capacity = capacity;
            this._structDefine = structDefine;
            const multiTypeBufferParams = {
                int16Count: structDefine._multiTypeBufferParams.int16Count * capacity,
                int32Count: structDefine._multiTypeBufferParams.int32Count * capacity,
                float32Count: structDefine._multiTypeBufferParams.float32Count * capacity,
            };
            this._buffer = new MultiTypeBuffer(multiTypeBufferParams);
        }
        set cursor(pos) {
            if (pos === this._cursor)
                return;
            const { _multiTypeBufferParams: multiTypeBufferParams } = this._structDefine;
            const buffer = this._buffer;
            buffer.int16Offset = multiTypeBufferParams.int16Count * pos;
            buffer.int32Offset = multiTypeBufferParams.int32Count * pos;
            buffer.float32Offset = multiTypeBufferParams.float32Count * pos;
            this._cursor = pos;
        }
        get cursor() {
            return this._cursor;
        }
        read() {
            const r = this._structDefine._read(this._buffer);
            this._cursor++;
            return r;
        }
        write(value) {
            this._structDefine._write(this._buffer, value);
            this._cursor++;
        }
        reset() {
            this._structDefine._reset(this._buffer);
            this._cursor++;
        }
    };
    class MultiTypeBuffer {
        constructor({ int16Count = 0, int32Count = 0, float32Count = 0 }) {
            this.int16Offset = 0;
            this._int16Array = null;
            this.int32Offset = 0;
            this._int32Array = null;
            this.float32Offset = 0;
            this._float32Array = null;
            if (int16Count > 0) {
                this._int16Array = new Int16Array(int16Count);
                this.int16Offset = 0;
            }
            if (int32Count > 0) {
                this._int32Array = new Int32Array(int32Count);
                this.int32Offset = 0;
            }
            if (float32Count > 0) {
                this._float32Array = new Float32Array(float32Count);
                this.float32Offset = 0;
            }
        }
        readInt16() {
            if (this._int16Array === null)
                throw new Error('No int16Array');
            const [a, b, c, d] = this._int16Array;
            return this._int16Array[this.int16Offset++];
        }
        *readMultipleInt16(count) {
            const array = this._int16Array;
            if (array === null)
                throw new Error('No int16Array');
            const begin = this.int16Offset;
            const end = this.int16Offset + count;
            this.int16Offset = end;
            for (let i = begin; i < end; ++i) {
                yield array[i];
            }
            return count;
        }
        writeInt16(value) {
            if (this._int16Array === null)
                throw new Error('No int16Array');
            this._int16Array[this.int16Offset++] = value;
        }
        writeMultipleInt16(...values) {
            const array = this._int16Array;
            if (array === null)
                throw new Error('No int16Array');
            const begin = this.int16Offset;
            const count = values.length;
            for (let i = 0; i < count; ++i) {
                array[i + begin] = values[i];
            }
            this.int16Offset = begin + count;
        }
        readInt32() {
            if (this._int32Array === null)
                throw new Error('No int32Array');
            return this._int32Array[this.int32Offset++];
        }
        *readMultipleInt32(count) {
            const array = this._int32Array;
            if (array === null)
                throw new Error('No int32Array');
            const begin = this.int32Offset;
            const end = this.int32Offset + count;
            this.int32Offset = end;
            for (let i = begin; i < end; ++i) {
                yield array[i];
            }
            return count;
        }
        writeInt32(value) {
            if (this._int32Array === null)
                throw new Error('No int32Array');
            this._int32Array[this.int32Offset++] = value;
        }
        writeMultipleInt32(...values) {
            const array = this._int32Array;
            if (array === null)
                throw new Error('No int32Array');
            const begin = this.int32Offset;
            const count = values.length;
            for (let i = 0; i < count; ++i) {
                array[i + begin] = values[i];
            }
            this.int32Offset = begin + count;
        }
        readFloat32() {
            if (this._float32Array === null)
                throw new Error('No float32Array');
            return this._float32Array[this.float32Offset++];
        }
        *readMultipleFloat32(count) {
            const array = this._float32Array;
            if (array === null)
                throw new Error('No float32Array');
            const begin = this.float32Offset;
            const end = this.float32Offset + count;
            this.float32Offset = end;
            for (let i = begin; i < end; ++i) {
                yield array[i];
            }
            return count;
        }
        writeFloat32(value) {
            if (this._float32Array === null)
                throw new Error('No float32Array');
            this._float32Array[this.float32Offset++] = value;
        }
        writeMultipleFloat32(...values) {
            const array = this._float32Array;
            if (array === null)
                throw new Error('No float32Array');
            const begin = this.float32Offset;
            const count = values.length;
            for (let i = 0; i < count; ++i) {
                array[i + begin] = values[i];
            }
            this.float32Offset = begin + count;
        }
    }

    class EmptyComponentRawArray {
        constructor(capacity, singleton) {
            this.cursor = 0;
            this.capacity = capacity;
            this._singleton = singleton;
        }
        read() {
            this.cursor++;
            return this._singleton;
        }
        write(_) {
            this.cursor++;
        }
        reset() {
            this.cursor++;
        }
    }

    class Entity {
        constructor(entityId, version) {
            this.entityId = entityId;
            this.version = version;
        }
        toString() {
            return `Entity(${this.entityId}, ${this.version})`;
        }
        static createRawArray(capacity) {
            return Entity.structDefine.createComponentRawArray(capacity);
        }
    }
    Entity.structDefine = new StructDefine({
        read(buffer) {
            const entityId = buffer.readInt16();
            const version = buffer.readInt16();
            return new Entity(entityId, version);
        },
        write(buffer, entity) {
            buffer.writeInt16(entity.entityId);
            buffer.writeInt16(entity.version);
        },
        reset(buffer) {
            buffer.writeInt16(0);
            buffer.writeInt16(0);
        },
    });
    class AliveTag {
        static createRawArray(capacity) {
            return new EmptyComponentRawArray(capacity, AliveTag.instance);
        }
    }
    AliveTag.instance = new AliveTag();
    class Translation {
        constructor(x, y, z) {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
        static createRawArray(capacity) {
            return Translation.structDefine.createComponentRawArray(capacity);
        }
    }
    Translation.structDefine = new StructDefine({
        read(buffer) {
            const r = new Translation();
            [r.x, r.y, r.z] = [...buffer.readMultipleFloat32(3)];
            return r;
        },
        write(buffer, translation) {
            buffer.writeMultipleFloat32(translation.x, translation.y, translation.z);
        },
        reset(buffer) {
            buffer.writeMultipleFloat32(0, 0, 0);
        },
    });

    class ComponentDataArray {
        constructor(componentRawArray) {
            this._count = 0;
            this._componentRawArray = componentRawArray;
        }
        get capacity() {
            return this._componentRawArray.capacity;
        }
        get count() {
            return this._count;
        }
        add(value) {
            if (this._count >= this._componentRawArray.capacity)
                throw new Error('Reach full capacity');
            const index = this._count;
            this._componentRawArray.cursor = index;
            if (value === undefined)
                this._componentRawArray.reset();
            else
                this._componentRawArray.write(value);
            this._count = index + 1;
            return index;
        }
        remove(index) {
            if (index >= this._count || index < 0)
                throw new Error('Remove exceed boundary');
            const lastIndex = this._count - 1;
            if (index === lastIndex) {
                this._count--;
                return null;
            }
            this._componentRawArray.cursor = lastIndex;
            const data = this._componentRawArray.read();
            this._componentRawArray.cursor = index;
            this._componentRawArray.write(data);
            this._count = lastIndex;
            return data;
        }
        get(index) {
            if (index >= this._count || index < 0)
                throw new Error('Get exceed boundary');
            this._componentRawArray.cursor = index;
            return this._componentRawArray.read();
        }
        set(index, value) {
            if (index >= this._count || index < 0)
                throw new Error('Set exceed boundary');
            this._componentRawArray.cursor = index;
            this._componentRawArray.write(value);
        }
        *[Symbol.iterator]() {
            let iterationCount = 0;
            for (let i = 0; i < this._count; ++i) {
                ++iterationCount;
                yield this.get(i);
            }
            return iterationCount;
        }
    }

    class Archetype {
        constructor(archetypeString, sortedComponentCtors) {
            this.archetypeString = archetypeString;
            this.componentCtors = sortedComponentCtors;
            this._entityDataArray = [];
            this._componentDataArrayMap = new Map();
            for (const componentCtor of sortedComponentCtors) {
                this._componentDataArrayMap.set(componentCtor.name, []);
            }
            this._chunkArray = [];
            this._systemStateComponentCtors = null;
            this._componentCtorMap = null;
            this._entityCount = 0;
        }
        static createEmpty() {
            return new Archetype('type<>', []);
        }
        get entityCount() {
            return this._entityCount;
        }
        getSystemStateComponentCtors() {
            let systemStateComponentCtors = this._systemStateComponentCtors;
            if (systemStateComponentCtors === null) {
                systemStateComponentCtors = new Array();
                this._systemStateComponentCtors = systemStateComponentCtors;
                for (const c of this.componentCtors) {
                    if (c.isSystemState) {
                        systemStateComponentCtors.push(c);
                    }
                }
            }
            return systemStateComponentCtors;
        }
        iterChunks() {
            return this._chunkArray[Symbol.iterator]();
        }
        getChunk(chunkIndex) {
            return this._chunkArray[chunkIndex];
        }
        addEntityData(data, entity) {
            let chunkIndex = 0;
            let chunk = null;
            const chunkArray = this._chunkArray;
            for (let i = 0; i < chunkArray.length; ++i) {
                const c = chunkArray[i];
                if (!c.isFull) {
                    chunkIndex = i;
                    chunk = c;
                    break;
                }
            }
            if (chunk === null) {
                chunk = this._createChunk();
                chunkIndex = chunkArray.length;
                chunkArray.push(chunk);
            }
            const entityIndex = chunk.addEntity(data, entity);
            this._entityCount++;
            return {
                chunkIndex,
                entityIndex,
            };
        }
        removeEntityData(chunkIndex, entityIndex) {
            const chunk = this._chunkArray[chunkIndex];
            const movedEntity = chunk.removeEntity(entityIndex);
            this._entityCount--;
            return movedEntity;
        }
        _createChunk() {
            const capacity = Archetype._chunkCapacity;
            const rawArray = Entity.createRawArray(capacity);
            const chunkIndex = this._entityDataArray.length;
            this._entityDataArray.push(new ComponentDataArray(rawArray));
            for (const componentCtor of this.componentCtors) {
                const rawArray = componentCtor.createRawArray(capacity);
                const componentDataArray = this._componentDataArrayMap.get(componentCtor.name);
                if (componentDataArray === undefined)
                    throw new Error('No componentDataArray for ' + componentCtor.name);
                componentDataArray.push(new ComponentDataArray(rawArray));
            }
            return new Chunk(this._entityDataArray, this._componentDataArrayMap, this.componentCtors, chunkIndex);
        }
        _getComponentCtorMap() {
            let componentCtorMap = this._componentCtorMap;
            if (componentCtorMap === null) {
                componentCtorMap = new Map();
                this._componentCtorMap = componentCtorMap;
                for (const c of this.componentCtors) {
                    componentCtorMap.set(c.name, c);
                }
            }
            return componentCtorMap;
        }
        hasComponent(componentCtor) {
            const componentCtorMap = this._getComponentCtorMap();
            return componentCtorMap.has(componentCtor.name);
        }
        matchQuery({ include, exclude }) {
            const componentCtorMap = this._getComponentCtorMap();
            for (const c of include) {
                if (!componentCtorMap.has(c.name)) {
                    return false;
                }
            }
            if (exclude) {
                for (const c of exclude) {
                    if (componentCtorMap.has(c.name)) {
                        return false;
                    }
                }
            }
            return true;
        }
    }
    Archetype._chunkCapacity = 512;
    class Chunk {
        constructor(entityDataArray, componentDataArrayMap, componentCtors, chunkIndex) {
            this._entityDataArray = entityDataArray;
            this._componentDataArrayMap = componentDataArrayMap;
            this._componentCtors = componentCtors;
            this._chunkIndex = chunkIndex;
        }
        get isFull() {
            const entityDataArray = this._entityDataArray[this._chunkIndex];
            return entityDataArray.count >= entityDataArray.capacity;
        }
        get capacity() {
            return this._entityDataArray[this._chunkIndex].capacity;
        }
        get count() {
            return this._entityDataArray[this._chunkIndex].count;
        }
        getDataArray(c) {
            const componentDataArray = this._componentDataArrayMap.get(c.name);
            if (!componentDataArray)
                return null;
            return componentDataArray[this._chunkIndex];
        }
        getEntityArray() {
            return this._entityDataArray[this._chunkIndex];
        }
        addEntity(data, entity) {
            const chunkIndex = this._chunkIndex;
            const index = this._entityDataArray[chunkIndex].add(entity);
            const componentDataArrayMap = this._componentDataArrayMap;
            for (const componentCtor of this._componentCtors) {
                const { name } = componentCtor;
                const componentDataArray = componentDataArrayMap.get(name);
                if (componentDataArray === undefined) {
                    throw new Error('No compnentDataArray for ' + name);
                }
                componentDataArray[chunkIndex].add(data.get(name));
            }
            return index;
        }
        removeEntity(index) {
            const chunkIndex = this._chunkIndex;
            const entityDataArray = this._entityDataArray[chunkIndex];
            const movedEntity = entityDataArray.remove(index);
            const componentDataArrayMap = this._componentDataArrayMap;
            for (const componentCtor of this._componentCtors) {
                const { name } = componentCtor;
                const componentDataArray = componentDataArrayMap.get(name);
                if (componentDataArray === undefined) {
                    throw new Error('No compnentDataArray for ' + name);
                }
                componentDataArray[chunkIndex].remove(index);
            }
            return movedEntity;
        }
    }
    ;
    class ArchetypeDatabase {
        constructor() {
            this._archetypeMap = new Map();
            this._version = 1;
        }
        get version() {
            return this._version;
        }
        getArchetype(componentCtors, addAliveTag = true) {
            const { archetypeString, sortedComponentCtors } = getArchetypeString(componentCtors, addAliveTag);
            if (this._archetypeMap.has(archetypeString)) {
                return this._archetypeMap.get(archetypeString);
            }
            else {
                const r = new Archetype(archetypeString, sortedComponentCtors);
                this._archetypeMap.set(archetypeString, r);
                this._version++;
                return r;
            }
        }
        archetypes() {
            return this._archetypeMap.values();
        }
    }
    function getArchetypeString(componentCtors, addAliveTag) {
        const componentCtorArray = addAliveTag ? [...componentCtors, AliveTag] : [...componentCtors];
        if (componentCtorArray.length === 0)
            throw new Error('componentCtors.length == 0');
        componentCtorArray.sort(function (a, b) {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
        let lastComponentCtor = null;
        for (const componentCtor of componentCtorArray) {
            if (lastComponentCtor !== null) {
                if (lastComponentCtor.name === componentCtor.name) {
                    throw new Error('Duplicated component ' + componentCtor.name);
                }
            }
            lastComponentCtor = componentCtor;
        }
        return {
            archetypeString: 'type<' + componentCtorArray.join(',') + '>',
            sortedComponentCtors: componentCtorArray,
        };
    }

    class EntityIdManger {
        constructor() {
            this._availableIdArray = new Array();
            this._entityInfoArray = [{
                    archetype: Archetype.createEmpty(),
                    chunkIndex: 0,
                    entityIndex: 0,
                    version: 0,
                }];
        }
        addEntity(archetype, chunkIndex, entityIndex) {
            const availableIdArray = this._availableIdArray;
            const entityInfoArray = this._entityInfoArray;
            let entityId;
            let version;
            if (availableIdArray.length > 0) {
                entityId = availableIdArray.pop();
                const entityInfo = entityInfoArray[entityId];
                entityInfo.archetype = archetype;
                entityInfo.chunkIndex = chunkIndex;
                entityInfo.entityIndex = entityIndex;
                version = entityInfo.version;
            }
            else {
                entityId = entityInfoArray.length;
                version = 1;
                entityInfoArray.push({
                    archetype,
                    chunkIndex,
                    entityIndex,
                    version,
                });
            }
            const entity = new Entity(entityId, version);
            archetype.getChunk(chunkIndex).getEntityArray().set(entityIndex, entity);
            return entity;
        }
        removeEntity(entity) {
            const entityInfo = this._entityInfoArray[entity.entityId];
            if (entityInfo.version !== entity.version) {
                throw new Error('Entity version expired');
            }
            entityInfo.version++;
            this._availableIdArray.push(entity.entityId);
        }
        getEntityInfo(entity) {
            const entityInfo = this._entityInfoArray[entity.entityId];
            return entityInfo.version === entity.version ? entityInfo : null;
        }
    }
    class ComponentCtorIterableAdptor {
        constructor(componentDataArray) {
            this._componentDataArray = componentDataArray;
        }
        *[Symbol.iterator]() {
            for (const componentData of this._componentDataArray) {
                const ctor = componentData.constructor;
                const value = ctor;
                if (!value.createRawArray) {
                    throw new Error(`Class ${ctor.name} is missing static method createRawArray`);
                }
                yield value;
            }
            return this._componentDataArray.length;
        }
    }
    class EntityManager {
        constructor() {
            this._tmpDataMap = new Map();
            this._queryMap = new Map();
            this._archetypeDatabase = new ArchetypeDatabase();
            this._entityIdManger = new EntityIdManger();
        }
        getArchetype(...componentCtor) {
            return this._archetypeDatabase.getArchetype(componentCtor);
        }
        createEntityOfArchetype(archetype, ...componentDataArray) {
            const tmpDataMap = this._tmpDataMap;
            for (const componentData of componentDataArray) {
                tmpDataMap.set(componentData.constructor.name, componentData);
            }
            const { chunkIndex, entityIndex } = archetype.addEntityData(tmpDataMap);
            tmpDataMap.clear();
            return this._entityIdManger.addEntity(archetype, chunkIndex, entityIndex);
        }
        createEntity(...componentDataArray) {
            if (componentDataArray.length === 0) {
                throw new Error('Can not add empty entity');
            }
            const archetype = this._archetypeDatabase.getArchetype(new ComponentCtorIterableAdptor(componentDataArray));
            return this.createEntityOfArchetype(archetype, ...componentDataArray);
        }
        static *_getComponentData(archetype, chunkIndex, entityIndex, componentCtorArray) {
            const chunk = archetype.getChunk(chunkIndex);
            let count = 0;
            for (const componentCtor of componentCtorArray) {
                const componentDataArray = chunk.getDataArray(componentCtor);
                if (componentDataArray === null)
                    throw new Error('No componentDataArray for ' + componentCtor.name);
                yield componentDataArray.get(entityIndex);
                ++count;
            }
            return count;
        }
        hasComponent(entity, componentCtor) {
            const entityInfo = this._entityIdManger.getEntityInfo(entity);
            if (!entityInfo) {
                throw new Error('Invalid entity ' + entity);
            }
            const { archetype } = entityInfo;
            return archetype.hasComponent(componentCtor);
        }
        getComponentData(entity, ...componentCtorArray) {
            const entityInfo = this._entityIdManger.getEntityInfo(entity);
            if (!entityInfo) {
                throw new Error('Invalid entity ' + entity);
            }
            const { archetype, chunkIndex, entityIndex } = entityInfo;
            return EntityManager._getComponentData(archetype, chunkIndex, entityIndex, componentCtorArray);
        }
        addComponent(entity, ...componentDataArray) {
            const entityInfo = this._entityIdManger.getEntityInfo(entity);
            if (!entityInfo) {
                console.trace('Invalid entity ', entity);
                return false;
            }
            const { archetype: oldArchetype, chunkIndex: oldChunkIndex, entityIndex: oldEntityIndex } = entityInfo;
            const componentCtorMap = new Map();
            for (const c of oldArchetype.componentCtors) {
                componentCtorMap.set(c.name, c);
            }
            const componentDataMap = new Map();
            for (const d of componentDataArray) {
                const ctor = d.constructor;
                if (!ctor.createRawArray) {
                    console.trace(ctor, 'is not a component class, in addComponent ', entity);
                    return false;
                }
                if (componentCtorMap.has(ctor.name)) {
                    console.trace(ctor, ' has already add to entity, in addComponent ', entity);
                    return false;
                }
                componentCtorMap.set(ctor.name, ctor);
                componentDataMap.set(ctor.name, d);
            }
            let i = 0;
            for (const d of EntityManager._getComponentData(oldArchetype, oldChunkIndex, oldEntityIndex, oldArchetype.componentCtors)) {
                const ctor = oldArchetype.componentCtors[i++];
                componentDataMap.set(ctor.name, d);
            }
            const movedEntity = oldArchetype.removeEntityData(oldChunkIndex, oldEntityIndex);
            if (movedEntity) {
                const movedEntityInfo = this._entityIdManger.getEntityInfo(movedEntity);
                if (movedEntityInfo === null)
                    throw new Error('Invalid entity ' + movedEntity);
                movedEntityInfo.entityIndex = oldEntityIndex;
            }
            const newArchetype = this._archetypeDatabase.getArchetype(componentCtorMap.values(), false);
            const { chunkIndex: newChunkIndex, entityIndex: newEntityIndex } = newArchetype.addEntityData(componentDataMap, entity);
            entityInfo.archetype = newArchetype;
            entityInfo.chunkIndex = newChunkIndex;
            entityInfo.entityIndex = newEntityIndex;
            return true;
        }
        removeComponent(entity, ...componentCtorArray) {
            const entityIdManger = this._entityIdManger;
            const entityInfo = entityIdManger.getEntityInfo(entity);
            if (!entityInfo) {
                console.trace('Invalid entity ', entity);
                return false;
            }
            const { archetype: oldArchetype, chunkIndex: oldChunkIndex, entityIndex: oldEntityIndex } = entityInfo;
            const componentCtorMap = new Map();
            for (const c of oldArchetype.componentCtors) {
                componentCtorMap.set(c.name, c);
            }
            for (const c of componentCtorArray) {
                if (!componentCtorMap.has(c.name)) {
                    console.trace(c, ' dose not exist in entity, in removeComponent ', entity);
                    return false;
                }
                componentCtorMap.delete(c.name);
            }
            const componentDataMap = new Map();
            let i = 0;
            const newComponentCtorArray = [...componentCtorMap.values()];
            for (const d of EntityManager._getComponentData(oldArchetype, oldChunkIndex, oldEntityIndex, newComponentCtorArray)) {
                const ctor = newComponentCtorArray[i++];
                componentDataMap.set(ctor.name, d);
            }
            const movedEntity = oldArchetype.removeEntityData(oldChunkIndex, oldEntityIndex);
            if (movedEntity) {
                const movedEntityInfo = entityIdManger.getEntityInfo(movedEntity);
                if (movedEntityInfo === null)
                    throw new Error('Invalid entity ' + movedEntity);
                movedEntityInfo.entityIndex = oldEntityIndex;
            }
            if (componentCtorMap.size === 0) {
                entityIdManger.removeEntity(entity);
            }
            else {
                const newArchetype = this._archetypeDatabase.getArchetype(newComponentCtorArray, false);
                const { chunkIndex: newChunkIndex, entityIndex: newEntityIndex } = newArchetype.addEntityData(componentDataMap, entity);
                entityInfo.archetype = newArchetype;
                entityInfo.chunkIndex = newChunkIndex;
                entityInfo.entityIndex = newEntityIndex;
            }
            return true;
        }
        deleteEntity(entity) {
            const entityIdManger = this._entityIdManger;
            const entityInfo = entityIdManger.getEntityInfo(entity);
            if (!entityInfo) {
                console.trace('Invalid entity ', entity);
                return false;
            }
            const { archetype, chunkIndex, entityIndex } = entityInfo;
            const systemStateComponentCtors = archetype.getSystemStateComponentCtors();
            if (systemStateComponentCtors.length === 0) {
                entityIdManger.removeEntity(entity);
            }
            else {
                const componentDataMap = new Map();
                let i = 0;
                for (const d of EntityManager._getComponentData(archetype, chunkIndex, entityIndex, systemStateComponentCtors)) {
                    const ctor = systemStateComponentCtors[i++];
                    componentDataMap.set(ctor.name, d);
                }
                const newArchetype = this._archetypeDatabase.getArchetype(systemStateComponentCtors, false);
                const { chunkIndex: newChunkIndex, entityIndex: newEntityIndex } = newArchetype.addEntityData(componentDataMap, entity);
                entityInfo.archetype = newArchetype;
                entityInfo.chunkIndex = newChunkIndex;
                entityInfo.entityIndex = newEntityIndex;
            }
            const movedEntity = archetype.removeEntityData(chunkIndex, entityIndex);
            if (movedEntity) {
                const movedEntityInfo = entityIdManger.getEntityInfo(movedEntity);
                if (movedEntityInfo === null)
                    throw new Error('Invalid entity ' + movedEntity);
                movedEntityInfo.entityIndex = entityIndex;
            }
            return true;
        }
        getQuery(queryDefine) {
            const includeNames = new Array();
            for (const ctor of queryDefine.include) {
                includeNames.push(ctor.name);
            }
            includeNames.sort();
            let eStr = '';
            if (queryDefine.exclude) {
                const excludeNames = new Array();
                for (const ctor of queryDefine.exclude) {
                    excludeNames.push(ctor.name);
                }
                excludeNames.sort();
                eStr = ',e=' + excludeNames.join(',');
            }
            const queryString = `query<i=${includeNames.join(',')}${eStr}>`;
            let r = this._queryMap.get(queryString);
            if (!r) {
                if (includeNames.length === 0 && eStr === '') {
                    r = new FullQuery(this._archetypeDatabase);
                }
                else {
                    r = new Query(this._archetypeDatabase, queryDefine);
                }
                this._queryMap.set(queryString, r);
            }
            return r;
        }
    }
    class Query {
        constructor(archetypeDatabase, queryDefine) {
            this._matchedArchetypeArray = null;
            this._version = 0;
            this._archetypeDatabase = archetypeDatabase;
            this._queryDefine = queryDefine;
        }
        _getMatchedArchetypeArray() {
            let matchedArchetypeArray = this._matchedArchetypeArray;
            if (this._version !== this._archetypeDatabase.version) {
                matchedArchetypeArray = [];
                this._matchedArchetypeArray = matchedArchetypeArray;
                for (const archetype of this._archetypeDatabase.archetypes()) {
                    if (archetype.matchQuery(this._queryDefine)) {
                        matchedArchetypeArray.push(archetype);
                    }
                }
                this._version = this._archetypeDatabase.version;
            }
            return matchedArchetypeArray;
        }
        isEmptyIgnoreFilter() {
            for (const archetype of this._getMatchedArchetypeArray()) {
                if (archetype.entityCount !== 0)
                    return false;
            }
            return true;
        }
        *iterChunks() {
            let count = 0;
            for (const archetype of this._getMatchedArchetypeArray()) {
                if (archetype.entityCount === 0)
                    continue;
                for (const chunk of archetype.iterChunks()) {
                    if (chunk.count === 0)
                        continue;
                    yield chunk;
                    ++count;
                }
            }
            return count;
        }
    }
    class FullQuery {
        constructor(archetypeDatabase) {
            this._archetypeDatabase = archetypeDatabase;
        }
        isEmptyIgnoreFilter() {
            for (const archetype of this._archetypeDatabase.archetypes()) {
                if (archetype.entityCount !== 0)
                    return false;
            }
            return true;
        }
        *iterChunks() {
            let count = 0;
            for (const archetype of this._archetypeDatabase.archetypes()) {
                if (archetype.entityCount === 0)
                    continue;
                for (const chunk of archetype.iterChunks()) {
                    if (chunk.count === 0)
                        continue;
                    yield chunk;
                    ++count;
                }
            }
            return count;
        }
    }

    class ObjectComponentRawArray {
        constructor(capacity, defaultValue) {
            this.cursor = 0;
            this.capacity = capacity;
            this._array = [];
            this._array.length = capacity;
            this._defaultValue = defaultValue;
        }
        read() {
            return this._array[this.cursor++];
        }
        write(value) {
            this._array[this.cursor++] = value;
        }
        reset() {
            this._array[this.cursor++] = this._defaultValue;
        }
    }

    class EntityIdManger$1 {
        constructor() {
            this._availableIdArray = new Array();
            this._entityInfoArray = [{
                    archetype: Archetype.createEmpty(),
                    chunkIndex: 0,
                    entityIndex: 0,
                    version: 0,
                }];
        }
        addEntity(archetype, chunkIndex, entityIndex) {
            const availableIdArray = this._availableIdArray;
            const entityInfoArray = this._entityInfoArray;
            let entityId;
            let version;
            if (availableIdArray.length > 0) {
                entityId = availableIdArray.pop();
                const entityInfo = entityInfoArray[entityId];
                entityInfo.archetype = archetype;
                entityInfo.chunkIndex = chunkIndex;
                entityInfo.entityIndex = entityIndex;
                version = entityInfo.version;
            }
            else {
                entityId = entityInfoArray.length;
                version = 1;
                entityInfoArray.push({
                    archetype,
                    chunkIndex,
                    entityIndex,
                    version,
                });
            }
            const entity = new Entity(entityId, version);
            archetype.getChunk(chunkIndex).getEntityArray().set(entityIndex, entity);
            return entity;
        }
        removeEntity(entity) {
            const entityInfo = this._entityInfoArray[entity.entityId];
            if (entityInfo.version !== entity.version) {
                throw new Error('Entity version expired');
            }
            entityInfo.version++;
            this._availableIdArray.push(entity.entityId);
        }
        getEntityInfo(entity) {
            const entityInfo = this._entityInfoArray[entity.entityId];
            return entityInfo.version === entity.version ? entityInfo : null;
        }
    }
    class ComponentCtorIterableAdptor$1 {
        constructor(componentDataArray) {
            this._componentDataArray = componentDataArray;
        }
        *[Symbol.iterator]() {
            for (const componentData of this._componentDataArray) {
                const ctor = componentData.constructor;
                const value = ctor;
                if (!value.createRawArray) {
                    throw new Error(`Class ${ctor.name} is missing static method createRawArray`);
                }
                yield value;
            }
            return this._componentDataArray.length;
        }
    }
    class EntityManager$1 {
        constructor() {
            this._tmpDataMap = new Map();
            this._queryMap = new Map();
            this._archetypeDatabase = new ArchetypeDatabase();
            this._entityIdManger = new EntityIdManger$1();
        }
        getArchetype(...componentCtor) {
            return this._archetypeDatabase.getArchetype(componentCtor);
        }
        createEntityOfArchetype(archetype, ...componentDataArray) {
            const tmpDataMap = this._tmpDataMap;
            for (const componentData of componentDataArray) {
                tmpDataMap.set(componentData.constructor.name, componentData);
            }
            const { chunkIndex, entityIndex } = archetype.addEntityData(tmpDataMap);
            tmpDataMap.clear();
            return this._entityIdManger.addEntity(archetype, chunkIndex, entityIndex);
        }
        createEntity(...componentDataArray) {
            if (componentDataArray.length === 0) {
                throw new Error('Can not add empty entity');
            }
            const archetype = this._archetypeDatabase.getArchetype(new ComponentCtorIterableAdptor$1(componentDataArray));
            return this.createEntityOfArchetype(archetype, ...componentDataArray);
        }
        static *_getComponentData(archetype, chunkIndex, entityIndex, componentCtorArray) {
            const chunk = archetype.getChunk(chunkIndex);
            let count = 0;
            for (const componentCtor of componentCtorArray) {
                const componentDataArray = chunk.getDataArray(componentCtor);
                if (componentDataArray === null)
                    throw new Error('No componentDataArray for ' + componentCtor.name);
                yield componentDataArray.get(entityIndex);
                ++count;
            }
            return count;
        }
        hasComponent(entity, componentCtor) {
            const entityInfo = this._entityIdManger.getEntityInfo(entity);
            if (!entityInfo) {
                throw new Error('Invalid entity ' + entity);
            }
            const { archetype } = entityInfo;
            return archetype.hasComponent(componentCtor);
        }
        getComponentData(entity, ...componentCtorArray) {
            const entityInfo = this._entityIdManger.getEntityInfo(entity);
            if (!entityInfo) {
                throw new Error('Invalid entity ' + entity);
            }
            const { archetype, chunkIndex, entityIndex } = entityInfo;
            return EntityManager$1._getComponentData(archetype, chunkIndex, entityIndex, componentCtorArray);
        }
        addComponent(entity, ...componentDataArray) {
            const entityInfo = this._entityIdManger.getEntityInfo(entity);
            if (!entityInfo) {
                console.trace('Invalid entity ', entity);
                return false;
            }
            const { archetype: oldArchetype, chunkIndex: oldChunkIndex, entityIndex: oldEntityIndex } = entityInfo;
            const componentCtorMap = new Map();
            for (const c of oldArchetype.componentCtors) {
                componentCtorMap.set(c.name, c);
            }
            const componentDataMap = new Map();
            for (const d of componentDataArray) {
                const ctor = d.constructor;
                if (!ctor.createRawArray) {
                    console.trace(ctor, 'is not a component class, in addComponent ', entity);
                    return false;
                }
                if (componentCtorMap.has(ctor.name)) {
                    console.trace(ctor, ' has already add to entity, in addComponent ', entity);
                    return false;
                }
                componentCtorMap.set(ctor.name, ctor);
                componentDataMap.set(ctor.name, d);
            }
            let i = 0;
            for (const d of EntityManager$1._getComponentData(oldArchetype, oldChunkIndex, oldEntityIndex, oldArchetype.componentCtors)) {
                const ctor = oldArchetype.componentCtors[i++];
                componentDataMap.set(ctor.name, d);
            }
            const movedEntity = oldArchetype.removeEntityData(oldChunkIndex, oldEntityIndex);
            if (movedEntity) {
                const movedEntityInfo = this._entityIdManger.getEntityInfo(movedEntity);
                if (movedEntityInfo === null)
                    throw new Error('Invalid entity ' + movedEntity);
                movedEntityInfo.entityIndex = oldEntityIndex;
            }
            const newArchetype = this._archetypeDatabase.getArchetype(componentCtorMap.values(), false);
            const { chunkIndex: newChunkIndex, entityIndex: newEntityIndex } = newArchetype.addEntityData(componentDataMap, entity);
            entityInfo.archetype = newArchetype;
            entityInfo.chunkIndex = newChunkIndex;
            entityInfo.entityIndex = newEntityIndex;
            return true;
        }
        removeComponent(entity, ...componentCtorArray) {
            const entityIdManger = this._entityIdManger;
            const entityInfo = entityIdManger.getEntityInfo(entity);
            if (!entityInfo) {
                console.trace('Invalid entity ', entity);
                return false;
            }
            const { archetype: oldArchetype, chunkIndex: oldChunkIndex, entityIndex: oldEntityIndex } = entityInfo;
            const componentCtorMap = new Map();
            for (const c of oldArchetype.componentCtors) {
                componentCtorMap.set(c.name, c);
            }
            for (const c of componentCtorArray) {
                if (!componentCtorMap.has(c.name)) {
                    console.trace(c, ' dose not exist in entity, in removeComponent ', entity);
                    return false;
                }
                componentCtorMap.delete(c.name);
            }
            const componentDataMap = new Map();
            let i = 0;
            const newComponentCtorArray = [...componentCtorMap.values()];
            for (const d of EntityManager$1._getComponentData(oldArchetype, oldChunkIndex, oldEntityIndex, newComponentCtorArray)) {
                const ctor = newComponentCtorArray[i++];
                componentDataMap.set(ctor.name, d);
            }
            const movedEntity = oldArchetype.removeEntityData(oldChunkIndex, oldEntityIndex);
            if (movedEntity) {
                const movedEntityInfo = entityIdManger.getEntityInfo(movedEntity);
                if (movedEntityInfo === null)
                    throw new Error('Invalid entity ' + movedEntity);
                movedEntityInfo.entityIndex = oldEntityIndex;
            }
            if (componentCtorMap.size === 0) {
                entityIdManger.removeEntity(entity);
            }
            else {
                const newArchetype = this._archetypeDatabase.getArchetype(newComponentCtorArray, false);
                const { chunkIndex: newChunkIndex, entityIndex: newEntityIndex } = newArchetype.addEntityData(componentDataMap, entity);
                entityInfo.archetype = newArchetype;
                entityInfo.chunkIndex = newChunkIndex;
                entityInfo.entityIndex = newEntityIndex;
            }
            return true;
        }
        deleteEntity(entity) {
            const entityIdManger = this._entityIdManger;
            const entityInfo = entityIdManger.getEntityInfo(entity);
            if (!entityInfo) {
                console.trace('Invalid entity ', entity);
                return false;
            }
            const { archetype, chunkIndex, entityIndex } = entityInfo;
            const systemStateComponentCtors = archetype.getSystemStateComponentCtors();
            if (systemStateComponentCtors.length === 0) {
                entityIdManger.removeEntity(entity);
            }
            else {
                const componentDataMap = new Map();
                let i = 0;
                for (const d of EntityManager$1._getComponentData(archetype, chunkIndex, entityIndex, systemStateComponentCtors)) {
                    const ctor = systemStateComponentCtors[i++];
                    componentDataMap.set(ctor.name, d);
                }
                const newArchetype = this._archetypeDatabase.getArchetype(systemStateComponentCtors, false);
                const { chunkIndex: newChunkIndex, entityIndex: newEntityIndex } = newArchetype.addEntityData(componentDataMap, entity);
                entityInfo.archetype = newArchetype;
                entityInfo.chunkIndex = newChunkIndex;
                entityInfo.entityIndex = newEntityIndex;
            }
            const movedEntity = archetype.removeEntityData(chunkIndex, entityIndex);
            if (movedEntity) {
                const movedEntityInfo = entityIdManger.getEntityInfo(movedEntity);
                if (movedEntityInfo === null)
                    throw new Error('Invalid entity ' + movedEntity);
                movedEntityInfo.entityIndex = entityIndex;
            }
            return true;
        }
        getQuery(queryDefine) {
            const includeNames = new Array();
            for (const ctor of queryDefine.include) {
                includeNames.push(ctor.name);
            }
            includeNames.sort();
            let eStr = '';
            if (queryDefine.exclude) {
                const excludeNames = new Array();
                for (const ctor of queryDefine.exclude) {
                    excludeNames.push(ctor.name);
                }
                excludeNames.sort();
                eStr = ',e=' + excludeNames.join(',');
            }
            const queryString = `query<i=${includeNames.join(',')}${eStr}>`;
            let r = this._queryMap.get(queryString);
            if (!r) {
                if (includeNames.length === 0 && eStr === '') {
                    r = new FullQuery$1(this._archetypeDatabase);
                }
                else {
                    r = new Query$1(this._archetypeDatabase, queryDefine);
                }
                this._queryMap.set(queryString, r);
            }
            return r;
        }
    }
    class Query$1 {
        constructor(archetypeDatabase, queryDefine) {
            this._matchedArchetypeArray = null;
            this._version = 0;
            this._archetypeDatabase = archetypeDatabase;
            this._queryDefine = queryDefine;
        }
        _getMatchedArchetypeArray() {
            let matchedArchetypeArray = this._matchedArchetypeArray;
            if (this._version !== this._archetypeDatabase.version) {
                matchedArchetypeArray = [];
                this._matchedArchetypeArray = matchedArchetypeArray;
                for (const archetype of this._archetypeDatabase.archetypes()) {
                    if (archetype.matchQuery(this._queryDefine)) {
                        matchedArchetypeArray.push(archetype);
                    }
                }
                this._version = this._archetypeDatabase.version;
            }
            return matchedArchetypeArray;
        }
        isEmptyIgnoreFilter() {
            for (const archetype of this._getMatchedArchetypeArray()) {
                if (archetype.entityCount !== 0)
                    return false;
            }
            return true;
        }
        *iterChunks() {
            let count = 0;
            for (const archetype of this._getMatchedArchetypeArray()) {
                if (archetype.entityCount === 0)
                    continue;
                for (const chunk of archetype.iterChunks()) {
                    if (chunk.count === 0)
                        continue;
                    yield chunk;
                    ++count;
                }
            }
            return count;
        }
    }
    class FullQuery$1 {
        constructor(archetypeDatabase) {
            this._archetypeDatabase = archetypeDatabase;
        }
        isEmptyIgnoreFilter() {
            for (const archetype of this._archetypeDatabase.archetypes()) {
                if (archetype.entityCount !== 0)
                    return false;
            }
            return true;
        }
        *iterChunks() {
            let count = 0;
            for (const archetype of this._archetypeDatabase.archetypes()) {
                if (archetype.entityCount === 0)
                    continue;
                for (const chunk of archetype.iterChunks()) {
                    if (chunk.count === 0)
                        continue;
                    yield chunk;
                    ++count;
                }
            }
            return count;
        }
    }

    class World {
        constructor(systems, tickInterval = 1 / 30, maxTickPerframe = 2) {
            this._nextTickTime = undefined;
            this._logicDelayTime = 0;
            this.entityManager = new EntityManager$1();
            const systemMap = new Map();
            this._systemMap = systemMap;
            for (const system of systems) {
                systemMap.set(system.constructor.name, system);
            }
            this._logicUpdateArray = [];
            this._presentUpdateArray = [];
            for (const system of systems) {
                const updateFunctions = system.createUpdateFuction(this);
                const { logicUpdate, presentUpdate } = updateFunctions;
                if (logicUpdate !== undefined)
                    this._logicUpdateArray.push(updateFunctions);
                if (presentUpdate !== undefined)
                    this._presentUpdateArray.push(updateFunctions);
            }
            this._timeInfo = {
                tickInterval,
                tick: 0,
                tickTime: 0,
                presentTime: 0,
            };
            this._maxTickPerframe = maxTickPerframe;
        }
        getSystem(ctor) {
            const r = this._systemMap.get(ctor.name);
            if (r === undefined)
                throw new Error('No system named ' + ctor.name);
            return r;
        }
        update(time) {
            const timeInfo = this._timeInfo;
            if (this._nextTickTime === undefined) {
                this._nextTickTime = time + timeInfo.tickInterval;
                timeInfo.tick = 1;
                timeInfo.tickTime = timeInfo.tickInterval;
                timeInfo.presentTime = timeInfo.tickInterval;
                this._logicDelayTime = time - timeInfo.presentTime;
                this._logicUpdate(timeInfo);
                this._presentUpdate(timeInfo);
                return;
            }
            let tickPerframe = 0;
            while (time >= this._nextTickTime) {
                timeInfo.tick++;
                const tickTime = timeInfo.tick * timeInfo.tickInterval;
                timeInfo.tickTime = tickTime;
                timeInfo.presentTime = tickTime;
                this._nextTickTime += timeInfo.tickInterval;
                this._logicUpdate(timeInfo);
                tickPerframe++;
                if (tickPerframe >= this._maxTickPerframe) {
                    break;
                }
            }
            let presentTime = time - this._logicDelayTime;
            const fragTime = presentTime - timeInfo.tickTime;
            if (fragTime >= timeInfo.tickInterval) {
                this._logicDelayTime += fragTime;
                presentTime = timeInfo.tickTime;
                this._nextTickTime = time + timeInfo.tickInterval;
            }
            timeInfo.presentTime = presentTime;
            this._presentUpdate(timeInfo);
        }
        _logicUpdate(timeInfo) {
            for (const updateFunctions of this._logicUpdateArray) {
                try {
                    if (updateFunctions.logicUpdate === undefined)
                        throw new Error();
                    updateFunctions.logicUpdate(timeInfo);
                }
                catch (ex) {
                    console.trace(ex);
                }
            }
        }
        _presentUpdate(timeInfo) {
            for (const updateFunctions of this._presentUpdateArray) {
                try {
                    if (updateFunctions.presentUpdate === undefined)
                        throw new Error();
                    updateFunctions.presentUpdate(timeInfo);
                }
                catch (ex) {
                    console.trace(ex);
                }
            }
        }
    }
    class ComponentSystem {
        createUpdateFuction(world) {
            return {};
        }
    }

    class PostDeleteEntitySystem extends ComponentSystem {
        constructor() {
            super(...arguments);
            this._queue = new Array();
        }
        enqueue(entity) {
            this._queue.push(entity);
        }
        createUpdateFuction(world) {
            const { entityManager } = world;
            return {
                logicUpdate: () => {
                    for (const entity of this._queue) {
                        entityManager.deleteEntity(entity);
                    }
                    this._queue.length = 0;
                }
            };
        }
    }

    class DeleteAtTickComponent {
        constructor(tick = 0) {
            this.tick = tick;
        }
        static createRawArray(capacity) {
            return DeleteAtTickComponent.structDefine.createComponentRawArray(capacity);
        }
    }
    DeleteAtTickComponent.structDefine = new StructDefine({
        read(buffer) {
            const v = new DeleteAtTickComponent();
            v.tick = buffer.readInt32();
            return v;
        },
        write(buffer, v) {
            buffer.writeInt32(v.tick);
        },
        reset(buffer) {
            buffer.writeInt32(0);
        },
    });
    class DeleteAtTickSystem extends ComponentSystem {
        createUpdateFuction(world) {
            const { entityManager } = world;
            const query = entityManager.getQuery({
                include: [DeleteAtTickComponent]
            });
            const postDeleteEntitySystem = world.getSystem(PostDeleteEntitySystem);
            return {
                logicUpdate: (timeInfo) => {
                    if (query.isEmptyIgnoreFilter())
                        return;
                    const { tick } = timeInfo;
                    for (const chunk of query.iterChunks()) {
                        const entityArray = chunk.getEntityArray();
                        const deleteTickArray = chunk.getDataArray(DeleteAtTickComponent);
                        if (deleteTickArray === null)
                            throw new Error();
                        for (let i = 0; i < chunk.count; ++i) {
                            if (deleteTickArray.get(i).tick <= tick) {
                                postDeleteEntitySystem.enqueue(entityArray.get(i));
                            }
                        }
                    }
                }
            };
        }
    }

    class PostCreateEntitySystem extends ComponentSystem {
        constructor() {
            super(...arguments);
            this._queue = new Array();
        }
        enqueue(archetype, ...componentDataArray) {
            this._queue.push({ archetype, componentDataArray });
        }
        createUpdateFuction(world) {
            const { entityManager } = world;
            return {
                logicUpdate: () => {
                    for (const { archetype, componentDataArray } of this._queue) {
                        entityManager.createEntityOfArchetype(archetype, ...componentDataArray);
                    }
                    this._queue.length = 0;
                }
            };
        }
    }

    class PostRemoveComponentSystem extends ComponentSystem {
        constructor() {
            super(...arguments);
            this._queue = new Array();
        }
        enqueue(entity, ...componentCtors) {
            this._queue.push({
                entity,
                componentCtors,
            });
        }
        createUpdateFuction(world) {
            const { entityManager } = world;
            return {
                logicUpdate: () => {
                    for (const { entity, componentCtors } of this._queue) {
                        entityManager.removeComponent(entity, ...componentCtors);
                    }
                    this._queue.length = 0;
                }
            };
        }
    }

    class LineMoveComponent {
        constructor() {
            this.beginTick = 0;
            this.originX = 0;
            this.originY = 0;
            this.originZ = 0;
            this.velocityX = 0;
            this.velocityY = 0;
            this.velocityZ = 0;
        }
        assignOrigin({ x = 0, y = 0, z = 0 }) {
            this.originX = x;
            this.originY = y;
            this.originZ = z;
            return this;
        }
        assignVelocity({ x = 0, y = 0, z = 0 }) {
            this.velocityX = x;
            this.velocityY = y;
            this.velocityZ = z;
            return this;
        }
        assignBeginTick(tick) {
            this.beginTick = tick;
            return this;
        }
        calculatePosition(tick, tickInterval, fragTime = 0) {
            if (tick <= this.beginTick) {
                return {
                    x: this.originX,
                    y: this.originY,
                    z: this.originZ,
                };
            }
            const t = (tick - this.beginTick) * tickInterval + fragTime;
            return {
                x: this.originX + this.velocityX * t,
                y: this.originY + this.velocityY * t,
                z: this.originZ + this.velocityZ * t,
            };
        }
        static createRawArray(capacity) {
            return LineMoveComponent.structDefine.createComponentRawArray(capacity);
        }
    }
    LineMoveComponent.structDefine = new StructDefine({
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
    class LineMoveSystem extends ComponentSystem {
        createUpdateFuction(world) {
            const { entityManager } = world;
            const query = entityManager.getQuery({
                include: [LineMoveComponent, Translation]
            });
            const update = (timeInfo) => {
                const { tick, tickInterval } = timeInfo;
                if (query.isEmptyIgnoreFilter())
                    return;
                const fragTime = timeInfo.presentTime - timeInfo.tickTime;
                for (const chunk of query.iterChunks()) {
                    const lineMoveDataArray = chunk.getDataArray(LineMoveComponent);
                    if (lineMoveDataArray === null)
                        throw new Error();
                    const translationArray = chunk.getDataArray(Translation);
                    if (translationArray === null)
                        throw new Error();
                    for (let i = 0; i < chunk.count; ++i) {
                        const lineMoveData = lineMoveDataArray.get(i);
                        if (tick <= lineMoveData.beginTick) {
                            translationArray.set(i, new Translation(lineMoveData.originX, lineMoveData.originY, lineMoveData.originZ));
                            continue;
                        }
                        const { x, y, z } = lineMoveData.calculatePosition(tick, tickInterval, fragTime);
                        translationArray.set(i, new Translation(x, y, z));
                    }
                }
            };
            return { logicUpdate: update, presentUpdate: update };
        }
    }

    function randomPointOnSphere(ud0, ud1, ud2, ud3) {
        ud0 = ud0 * 2 - 1;
        ud1 = ud1 * 2 - 1;
        ud2 = ud2 * 2 - 1;
        ud3 = ud3 * 2 - 1;
        const ud02 = ud0 * ud0;
        const ud12 = ud1 * ud1;
        const ud22 = ud2 * ud2;
        const ud32 = ud3 * ud3;
        const m = ud02 + ud12 + ud22 + ud32;
        if (m >= 1)
            return undefined;
        return {
            x: 2 * (ud1 * ud3 + ud0 * ud2) / m,
            y: 2 * (ud2 * ud3 - ud0 * ud1) / m,
            z: (ud02 + ud32 - ud12 - ud22) / m,
        };
    }
    function poissonNextTime(ud) {
        return -Math.log(1 - ud);
    }
    function randomPointInCircle(ud0, ud1, ud2) {
        const t = 2 * Math.PI * ud0;
        const u = ud1 + ud2;
        const r = u > 1 ? 2 - u : u;
        return {
            x: r * Math.cos(t),
            y: r * Math.sin(t),
        };
    }

    const SMALLEST_UNSAFE_INTEGER = 0x20000000000000;
    const LARGEST_SAFE_INTEGER = SMALLEST_UNSAFE_INTEGER - 1;
    const UINT32_MAX = -1 >>> 0;
    const UINT32_SIZE = UINT32_MAX + 1;
    const INT32_SIZE = UINT32_SIZE / 2;
    const INT32_MAX = INT32_SIZE - 1;
    const UINT21_SIZE = 1 << 21;
    const UINT21_MAX = UINT21_SIZE - 1;

    /**
     * Returns a value within [-0x80000000, 0x7fffffff]
     */
    function int32(engine) {
        return engine.next() | 0;
    }

    function add(distribution, addend) {
        if (addend === 0) {
            return distribution;
        }
        else {
            return engine => distribution(engine) + addend;
        }
    }

    /**
     * Returns a value within [-0x20000000000000, 0x1fffffffffffff]
     */
    function int53(engine) {
        const high = engine.next() | 0;
        const low = engine.next() >>> 0;
        return ((high & UINT21_MAX) * UINT32_SIZE +
            low +
            (high & UINT21_SIZE ? -SMALLEST_UNSAFE_INTEGER : 0));
    }

    /**
     * Returns a value within [-0x20000000000000, 0x20000000000000]
     */
    function int53Full(engine) {
        while (true) {
            const high = engine.next() | 0;
            if (high & 0x400000) {
                if ((high & 0x7fffff) === 0x400000 && (engine.next() | 0) === 0) {
                    return SMALLEST_UNSAFE_INTEGER;
                }
            }
            else {
                const low = engine.next() >>> 0;
                return ((high & UINT21_MAX) * UINT32_SIZE +
                    low +
                    (high & UINT21_SIZE ? -SMALLEST_UNSAFE_INTEGER : 0));
            }
        }
    }

    /**
     * Returns a value within [0, 0xffffffff]
     */
    function uint32(engine) {
        return engine.next() >>> 0;
    }

    /**
     * Returns a value within [0, 0x1fffffffffffff]
     */
    function uint53(engine) {
        const high = engine.next() & UINT21_MAX;
        const low = engine.next() >>> 0;
        return high * UINT32_SIZE + low;
    }

    /**
     * Returns a value within [0, 0x20000000000000]
     */
    function uint53Full(engine) {
        while (true) {
            const high = engine.next() | 0;
            if (high & UINT21_SIZE) {
                if ((high & UINT21_MAX) === 0 && (engine.next() | 0) === 0) {
                    return SMALLEST_UNSAFE_INTEGER;
                }
            }
            else {
                const low = engine.next() >>> 0;
                return (high & UINT21_MAX) * UINT32_SIZE + low;
            }
        }
    }

    function isPowerOfTwoMinusOne(value) {
        return ((value + 1) & value) === 0;
    }
    function bitmask(masking) {
        return (engine) => engine.next() & masking;
    }
    function downscaleToLoopCheckedRange(range) {
        const extendedRange = range + 1;
        const maximum = extendedRange * Math.floor(UINT32_SIZE / extendedRange);
        return engine => {
            let value = 0;
            do {
                value = engine.next() >>> 0;
            } while (value >= maximum);
            return value % extendedRange;
        };
    }
    function downscaleToRange(range) {
        if (isPowerOfTwoMinusOne(range)) {
            return bitmask(range);
        }
        else {
            return downscaleToLoopCheckedRange(range);
        }
    }
    function isEvenlyDivisibleByMaxInt32(value) {
        return (value | 0) === 0;
    }
    function upscaleWithHighMasking(masking) {
        return engine => {
            const high = engine.next() & masking;
            const low = engine.next() >>> 0;
            return high * UINT32_SIZE + low;
        };
    }
    function upscaleToLoopCheckedRange(extendedRange) {
        const maximum = extendedRange * Math.floor(SMALLEST_UNSAFE_INTEGER / extendedRange);
        return engine => {
            let ret = 0;
            do {
                const high = engine.next() & UINT21_MAX;
                const low = engine.next() >>> 0;
                ret = high * UINT32_SIZE + low;
            } while (ret >= maximum);
            return ret % extendedRange;
        };
    }
    function upscaleWithinU53(range) {
        const extendedRange = range + 1;
        if (isEvenlyDivisibleByMaxInt32(extendedRange)) {
            const highRange = ((extendedRange / UINT32_SIZE) | 0) - 1;
            if (isPowerOfTwoMinusOne(highRange)) {
                return upscaleWithHighMasking(highRange);
            }
        }
        return upscaleToLoopCheckedRange(extendedRange);
    }
    function upscaleWithinI53AndLoopCheck(min, max) {
        return engine => {
            let ret = 0;
            do {
                const high = engine.next() | 0;
                const low = engine.next() >>> 0;
                ret =
                    (high & UINT21_MAX) * UINT32_SIZE +
                        low +
                        (high & UINT21_SIZE ? -SMALLEST_UNSAFE_INTEGER : 0);
            } while (ret < min || ret > max);
            return ret;
        };
    }
    /**
     * Returns a Distribution to return a value within [min, max]
     * @param min The minimum integer value, inclusive. No less than -0x20000000000000.
     * @param max The maximum integer value, inclusive. No greater than 0x20000000000000.
     */
    function integer(min, max) {
        min = Math.floor(min);
        max = Math.floor(max);
        if (min < -SMALLEST_UNSAFE_INTEGER || !isFinite(min)) {
            throw new RangeError(`Expected min to be at least ${-SMALLEST_UNSAFE_INTEGER}`);
        }
        else if (max > SMALLEST_UNSAFE_INTEGER || !isFinite(max)) {
            throw new RangeError(`Expected max to be at most ${SMALLEST_UNSAFE_INTEGER}`);
        }
        const range = max - min;
        if (range <= 0 || !isFinite(range)) {
            return () => min;
        }
        else if (range === UINT32_MAX) {
            if (min === 0) {
                return uint32;
            }
            else {
                return add(int32, min + INT32_SIZE);
            }
        }
        else if (range < UINT32_MAX) {
            return add(downscaleToRange(range), min);
        }
        else if (range === LARGEST_SAFE_INTEGER) {
            return add(uint53, min);
        }
        else if (range < LARGEST_SAFE_INTEGER) {
            return add(upscaleWithinU53(range), min);
        }
        else if (max - 1 - min === LARGEST_SAFE_INTEGER) {
            return add(uint53Full, min);
        }
        else if (min === -SMALLEST_UNSAFE_INTEGER &&
            max === SMALLEST_UNSAFE_INTEGER) {
            return int53Full;
        }
        else if (min === -SMALLEST_UNSAFE_INTEGER && max === LARGEST_SAFE_INTEGER) {
            return int53;
        }
        else if (min === -LARGEST_SAFE_INTEGER && max === SMALLEST_UNSAFE_INTEGER) {
            return add(int53, 1);
        }
        else if (max === SMALLEST_UNSAFE_INTEGER) {
            return add(upscaleWithinI53AndLoopCheck(min - 1, max - 1), 1);
        }
        else {
            return upscaleWithinI53AndLoopCheck(min, max);
        }
    }

    function isLeastBitTrue(engine) {
        return (engine.next() & 1) === 1;
    }
    function lessThan(distribution, value) {
        return engine => distribution(engine) < value;
    }
    function probability(percentage) {
        if (percentage <= 0) {
            return () => false;
        }
        else if (percentage >= 1) {
            return () => true;
        }
        else {
            const scaled = percentage * UINT32_SIZE;
            if (scaled % 1 === 0) {
                return lessThan(int32, (scaled - INT32_SIZE) | 0);
            }
            else {
                return lessThan(uint53, Math.round(percentage * SMALLEST_UNSAFE_INTEGER));
            }
        }
    }
    function bool(numerator, denominator) {
        if (denominator == null) {
            if (numerator == null) {
                return isLeastBitTrue;
            }
            return probability(numerator);
        }
        else {
            if (numerator <= 0) {
                return () => false;
            }
            else if (numerator >= denominator) {
                return () => true;
            }
            return lessThan(integer(0, denominator - 1), numerator);
        }
    }

    /**
     * Returns a Distribution that returns a random `Date` within the inclusive
     * range of [`start`, `end`].
     * @param start The minimum `Date`
     * @param end The maximum `Date`
     */
    function date(start, end) {
        const distribution = integer(+start, +end);
        return engine => new Date(distribution(engine));
    }

    /**
     * Returns a Distribution to return a value within [1, sideCount]
     * @param sideCount The number of sides of the die
     */
    function die(sideCount) {
        return integer(1, sideCount);
    }

    /**
     * Returns a distribution that returns an array of length `dieCount` of values
     * within [1, `sideCount`]
     * @param sideCount The number of sides of each die
     * @param dieCount The number of dice
     */
    function dice(sideCount, dieCount) {
        const distribution = die(sideCount);
        return engine => {
            const result = [];
            for (let i = 0; i < dieCount; ++i) {
                result.push(distribution(engine));
            }
            return result;
        };
    }

    // tslint:disable:unified-signatures
    // has 2**x chars, for faster uniform distribution
    const DEFAULT_STRING_POOL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
    function string(pool = DEFAULT_STRING_POOL) {
        const poolLength = pool.length;
        if (!poolLength) {
            throw new Error("Expected pool not to be an empty string");
        }
        const distribution = integer(0, poolLength - 1);
        return (engine, length) => {
            let result = "";
            for (let i = 0; i < length; ++i) {
                const j = distribution(engine);
                result += pool.charAt(j);
            }
            return result;
        };
    }

    const LOWER_HEX_POOL = "0123456789abcdef";
    const lowerHex = string(LOWER_HEX_POOL);
    const upperHex = string(LOWER_HEX_POOL.toUpperCase());
    /**
     * Returns a Distribution that returns a random string comprised of numbers
     * or the characters `abcdef` (or `ABCDEF`) of length `length`.
     * @param length Length of the result string
     * @param uppercase Whether the string should use `ABCDEF` instead of `abcdef`
     */
    function hex(uppercase) {
        if (uppercase) {
            return upperHex;
        }
        else {
            return lowerHex;
        }
    }

    function convertSliceArgument(value, length) {
        if (value < 0) {
            return Math.max(value + length, 0);
        }
        else {
            return Math.min(value, length);
        }
    }

    function toInteger(value) {
        const num = +value;
        if (num < 0) {
            return Math.ceil(num);
        }
        else {
            return Math.floor(num);
        }
    }

    /**
     * Returns a random value within the provided `source` within the sliced
     * bounds of `begin` and `end`.
     * @param source an array of items to pick from
     * @param begin the beginning slice index (defaults to `0`)
     * @param end the ending slice index (defaults to `source.length`)
     */
    function pick(engine, source, begin, end) {
        const length = source.length;
        if (length === 0) {
            throw new RangeError("Cannot pick from an empty array");
        }
        const start = begin == null ? 0 : convertSliceArgument(toInteger(begin), length);
        const finish = end === void 0 ? length : convertSliceArgument(toInteger(end), length);
        if (start >= finish) {
            throw new RangeError(`Cannot pick between bounds ${start} and ${finish}`);
        }
        const distribution = integer(start, finish - 1);
        return source[distribution(engine)];
    }

    function multiply(distribution, multiplier) {
        if (multiplier === 1) {
            return distribution;
        }
        else if (multiplier === 0) {
            return () => 0;
        }
        else {
            return engine => distribution(engine) * multiplier;
        }
    }

    /**
     * Returns a floating-point value within [0.0, 1.0)
     */
    function realZeroToOneExclusive(engine) {
        return uint53(engine) / SMALLEST_UNSAFE_INTEGER;
    }

    /**
     * Returns a floating-point value within [0.0, 1.0]
     */
    function realZeroToOneInclusive(engine) {
        return uint53Full(engine) / SMALLEST_UNSAFE_INTEGER;
    }

    /**
     * Returns a floating-point value within [min, max) or [min, max]
     * @param min The minimum floating-point value, inclusive.
     * @param max The maximum floating-point value.
     * @param inclusive If true, `max` will be inclusive.
     */
    function real(min, max, inclusive = false) {
        if (!isFinite(min)) {
            throw new RangeError("Expected min to be a finite number");
        }
        else if (!isFinite(max)) {
            throw new RangeError("Expected max to be a finite number");
        }
        return add(multiply(inclusive ? realZeroToOneInclusive : realZeroToOneExclusive, max - min), min);
    }

    const sliceArray = Array.prototype.slice;

    /**
     * Shuffles an array in-place
     * @param engine The Engine to use when choosing random values
     * @param array The array to shuffle
     * @param downTo minimum index to shuffle. Only used internally.
     */
    function shuffle(engine, array, downTo = 0) {
        const length = array.length;
        if (length) {
            for (let i = (length - 1) >>> 0; i > downTo; --i) {
                const distribution = integer(0, i);
                const j = distribution(engine);
                if (i !== j) {
                    const tmp = array[i];
                    array[i] = array[j];
                    array[j] = tmp;
                }
            }
        }
        return array;
    }

    /**
     * From the population array, produce an array with sampleSize elements that
     * are randomly chosen without repeats.
     * @param engine The Engine to use when choosing random values
     * @param population An array that has items to choose a sample from
     * @param sampleSize The size of the result array
     */
    function sample(engine, population, sampleSize) {
        if (sampleSize < 0 ||
            sampleSize > population.length ||
            !isFinite(sampleSize)) {
            throw new RangeError("Expected sampleSize to be within 0 and the length of the population");
        }
        if (sampleSize === 0) {
            return [];
        }
        const clone = sliceArray.call(population);
        const length = clone.length;
        if (length === sampleSize) {
            return shuffle(engine, clone, 0);
        }
        const tailLength = length - sampleSize;
        return shuffle(engine, clone, tailLength - 1).slice(tailLength);
    }

    const stringRepeat = (() => {
        try {
            if ("x".repeat(3) === "xxx") {
                return (pattern, count) => pattern.repeat(count);
            }
        }
        catch (_) {
            // nothing to do here
        }
        return (pattern, count) => {
            let result = "";
            while (count > 0) {
                if (count & 1) {
                    result += pattern;
                }
                count >>= 1;
                pattern += pattern;
            }
            return result;
        };
    })();

    function zeroPad(text, zeroCount) {
        return stringRepeat("0", zeroCount - text.length) + text;
    }
    /**
     * Returns a Universally Unique Identifier Version 4.
     *
     * See http://en.wikipedia.org/wiki/Universally_unique_identifier
     */
    function uuid4(engine) {
        const a = engine.next() >>> 0;
        const b = engine.next() | 0;
        const c = engine.next() | 0;
        const d = engine.next() >>> 0;
        return (zeroPad(a.toString(16), 8) +
            "-" +
            zeroPad((b & 0xffff).toString(16), 4) +
            "-" +
            zeroPad((((b >> 4) & 0x0fff) | 0x4000).toString(16), 4) +
            "-" +
            zeroPad(((c & 0x3fff) | 0x8000).toString(16), 4) +
            "-" +
            zeroPad(((c >> 4) & 0xffff).toString(16), 4) +
            zeroPad(d.toString(16), 8));
    }

    /**
     * An int32-producing Engine that uses `Math.random()`
     */
    const nativeMath = {
        next() {
            return (Math.random() * UINT32_SIZE) | 0;
        }
    };

    // tslint:disable:unified-signatures
    /**
     * A wrapper around an Engine that provides easy-to-use methods for
     * producing values based on known distributions
     */
    class Random {
        /**
         * Creates a new Random wrapper
         * @param engine The engine to use (defaults to a `Math.random`-based implementation)
         */
        constructor(engine = nativeMath) {
            this.engine = engine;
        }
        /**
         * Returns a value within [-0x80000000, 0x7fffffff]
         */
        int32() {
            return int32(this.engine);
        }
        /**
         * Returns a value within [0, 0xffffffff]
         */
        uint32() {
            return uint32(this.engine);
        }
        /**
         * Returns a value within [0, 0x1fffffffffffff]
         */
        uint53() {
            return uint53(this.engine);
        }
        /**
         * Returns a value within [0, 0x20000000000000]
         */
        uint53Full() {
            return uint53Full(this.engine);
        }
        /**
         * Returns a value within [-0x20000000000000, 0x1fffffffffffff]
         */
        int53() {
            return int53(this.engine);
        }
        /**
         * Returns a value within [-0x20000000000000, 0x20000000000000]
         */
        int53Full() {
            return int53Full(this.engine);
        }
        /**
         * Returns a value within [min, max]
         * @param min The minimum integer value, inclusive. No less than -0x20000000000000.
         * @param max The maximum integer value, inclusive. No greater than 0x20000000000000.
         */
        integer(min, max) {
            return integer(min, max)(this.engine);
        }
        /**
         * Returns a floating-point value within [0.0, 1.0]
         */
        realZeroToOneInclusive() {
            return realZeroToOneInclusive(this.engine);
        }
        /**
         * Returns a floating-point value within [0.0, 1.0)
         */
        realZeroToOneExclusive() {
            return realZeroToOneExclusive(this.engine);
        }
        /**
         * Returns a floating-point value within [min, max) or [min, max]
         * @param min The minimum floating-point value, inclusive.
         * @param max The maximum floating-point value.
         * @param inclusive If true, `max` will be inclusive.
         */
        real(min, max, inclusive = false) {
            return real(min, max, inclusive)(this.engine);
        }
        bool(numerator, denominator) {
            return bool(numerator, denominator)(this.engine);
        }
        /**
         * Return a random value within the provided `source` within the sliced
         * bounds of `begin` and `end`.
         * @param source an array of items to pick from
         * @param begin the beginning slice index (defaults to `0`)
         * @param end the ending slice index (defaults to `source.length`)
         */
        pick(source, begin, end) {
            return pick(this.engine, source, begin, end);
        }
        /**
         * Shuffles an array in-place
         * @param array The array to shuffle
         */
        shuffle(array) {
            return shuffle(this.engine, array);
        }
        /**
         * From the population array, returns an array with sampleSize elements that
         * are randomly chosen without repeats.
         * @param population An array that has items to choose a sample from
         * @param sampleSize The size of the result array
         */
        sample(population, sampleSize) {
            return sample(this.engine, population, sampleSize);
        }
        /**
         * Returns a value within [1, sideCount]
         * @param sideCount The number of sides of the die
         */
        die(sideCount) {
            return die(sideCount)(this.engine);
        }
        /**
         * Returns an array of length `dieCount` of values within [1, sideCount]
         * @param sideCount The number of sides of each die
         * @param dieCount The number of dice
         */
        dice(sideCount, dieCount) {
            return dice(sideCount, dieCount)(this.engine);
        }
        /**
         * Returns a Universally Unique Identifier Version 4.
         *
         * See http://en.wikipedia.org/wiki/Universally_unique_identifier
         */
        uuid4() {
            return uuid4(this.engine);
        }
        string(length, pool) {
            return string(pool)(this.engine, length);
        }
        /**
         * Returns a random string comprised of numbers or the characters `abcdef`
         * (or `ABCDEF`) of length `length`.
         * @param length Length of the result string
         * @param uppercase Whether the string should use `ABCDEF` instead of `abcdef`
         */
        hex(length, uppercase) {
            return hex(uppercase)(this.engine, length);
        }
        /**
         * Returns a random `Date` within the inclusive range of [`start`, `end`].
         * @param start The minimum `Date`
         * @param end The maximum `Date`
         */
        date(start, end) {
            return date(start, end)(this.engine);
        }
    }

    /**
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
     */
    const I32Array = (() => {
        try {
            const buffer = new ArrayBuffer(4);
            const view = new Int32Array(buffer);
            view[0] = INT32_SIZE;
            if (view[0] === -INT32_SIZE) {
                return Int32Array;
            }
        }
        catch (_) {
            // nothing to do here
        }
        return Array;
    })();

    let data = null;
    const COUNT = 128;
    let index = COUNT;
    /**
     * An Engine that relies on the globally-available `crypto.getRandomValues`,
     * which is typically available in modern browsers.
     *
     * See https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
     *
     * If unavailable or otherwise non-functioning, then `browserCrypto` will
     * likely `throw` on the first call to `next()`.
     */
    const browserCrypto = {
        next() {
            if (index >= COUNT) {
                if (data === null) {
                    data = new I32Array(COUNT);
                }
                crypto.getRandomValues(data);
                index = 0;
            }
            return data[index++] | 0;
        }
    };

    /**
     * Returns an array of random int32 values, based on current time
     * and a random number engine
     *
     * @param engine an Engine to pull random values from, default `nativeMath`
     * @param length the length of the Array, minimum 1, default 16
     */
    function createEntropy(engine = nativeMath, length = 16) {
        const array = [];
        array.push(new Date().getTime() | 0);
        for (let i = 1; i < length; ++i) {
            array[i] = engine.next() | 0;
        }
        return array;
    }

    /**
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
     */
    const imul = (() => {
        try {
            if (Math.imul(UINT32_MAX, 5) === -5) {
                return Math.imul;
            }
        }
        catch (_) {
            // nothing to do here
        }
        const UINT16_MAX = 0xffff;
        return (a, b) => {
            const ah = (a >>> 16) & UINT16_MAX;
            const al = a & UINT16_MAX;
            const bh = (b >>> 16) & UINT16_MAX;
            const bl = b & UINT16_MAX;
            // the shift by 0 fixes the sign on the high part
            // the final |0 converts the unsigned value into a signed value
            return (al * bl + (((ah * bl + al * bh) << 16) >>> 0)) | 0;
        };
    })();

    const ARRAY_SIZE = 624;
    const ARRAY_MAX = ARRAY_SIZE - 1;
    const M = 397;
    const ARRAY_SIZE_MINUS_M = ARRAY_SIZE - M;
    const A = 0x9908b0df;
    /**
     * An Engine that is a pseudorandom number generator using the Mersenne
     * Twister algorithm based on the prime 2**19937 − 1
     *
     * See http://en.wikipedia.org/wiki/Mersenne_twister
     */
    class MersenneTwister19937 {
        /**
         * MersenneTwister19937 should not be instantiated directly.
         * Instead, use the static methods `seed`, `seedWithArray`, or `autoSeed`.
         */
        constructor() {
            this.data = new I32Array(ARRAY_SIZE);
            this.index = 0; // integer within [0, 624]
            this.uses = 0;
        }
        /**
         * Returns a MersenneTwister19937 seeded with an initial int32 value
         * @param initial the initial seed value
         */
        static seed(initial) {
            return new MersenneTwister19937().seed(initial);
        }
        /**
         * Returns a MersenneTwister19937 seeded with zero or more int32 values
         * @param source A series of int32 values
         */
        static seedWithArray(source) {
            return new MersenneTwister19937().seedWithArray(source);
        }
        /**
         * Returns a MersenneTwister19937 seeded with the current time and
         * a series of natively-generated random values
         */
        static autoSeed() {
            return MersenneTwister19937.seedWithArray(createEntropy());
        }
        /**
         * Returns the next int32 value of the sequence
         */
        next() {
            if ((this.index | 0) >= ARRAY_SIZE) {
                refreshData(this.data);
                this.index = 0;
            }
            const value = this.data[this.index];
            this.index = (this.index + 1) | 0;
            this.uses += 1;
            return temper(value) | 0;
        }
        /**
         * Returns the number of times that the Engine has been used.
         *
         * This can be provided to an unused MersenneTwister19937 with the same
         * seed, bringing it to the exact point that was left off.
         */
        getUseCount() {
            return this.uses;
        }
        /**
         * Discards one or more items from the engine
         * @param count The count of items to discard
         */
        discard(count) {
            if (count <= 0) {
                return this;
            }
            this.uses += count;
            if ((this.index | 0) >= ARRAY_SIZE) {
                refreshData(this.data);
                this.index = 0;
            }
            while (count + this.index > ARRAY_SIZE) {
                count -= ARRAY_SIZE - this.index;
                refreshData(this.data);
                this.index = 0;
            }
            this.index = (this.index + count) | 0;
            return this;
        }
        seed(initial) {
            let previous = 0;
            this.data[0] = previous = initial | 0;
            for (let i = 1; i < ARRAY_SIZE; i = (i + 1) | 0) {
                this.data[i] = previous =
                    (imul(previous ^ (previous >>> 30), 0x6c078965) + i) | 0;
            }
            this.index = ARRAY_SIZE;
            this.uses = 0;
            return this;
        }
        seedWithArray(source) {
            this.seed(0x012bd6aa);
            seedWithArray(this.data, source);
            return this;
        }
    }
    function refreshData(data) {
        let k = 0;
        let tmp = 0;
        for (; (k | 0) < ARRAY_SIZE_MINUS_M; k = (k + 1) | 0) {
            tmp = (data[k] & INT32_SIZE) | (data[(k + 1) | 0] & INT32_MAX);
            data[k] = data[(k + M) | 0] ^ (tmp >>> 1) ^ (tmp & 0x1 ? A : 0);
        }
        for (; (k | 0) < ARRAY_MAX; k = (k + 1) | 0) {
            tmp = (data[k] & INT32_SIZE) | (data[(k + 1) | 0] & INT32_MAX);
            data[k] =
                data[(k - ARRAY_SIZE_MINUS_M) | 0] ^ (tmp >>> 1) ^ (tmp & 0x1 ? A : 0);
        }
        tmp = (data[ARRAY_MAX] & INT32_SIZE) | (data[0] & INT32_MAX);
        data[ARRAY_MAX] = data[M - 1] ^ (tmp >>> 1) ^ (tmp & 0x1 ? A : 0);
    }
    function temper(value) {
        value ^= value >>> 11;
        value ^= (value << 7) & 0x9d2c5680;
        value ^= (value << 15) & 0xefc60000;
        return value ^ (value >>> 18);
    }
    function seedWithArray(data, source) {
        let i = 1;
        let j = 0;
        const sourceLength = source.length;
        let k = Math.max(sourceLength, ARRAY_SIZE) | 0;
        let previous = data[0] | 0;
        for (; (k | 0) > 0; --k) {
            data[i] = previous =
                ((data[i] ^ imul(previous ^ (previous >>> 30), 0x0019660d)) +
                    (source[j] | 0) +
                    (j | 0)) |
                    0;
            i = (i + 1) | 0;
            ++j;
            if ((i | 0) > ARRAY_MAX) {
                data[0] = data[ARRAY_MAX];
                i = 1;
            }
            if (j >= sourceLength) {
                j = 0;
            }
        }
        for (k = ARRAY_MAX; (k | 0) > 0; --k) {
            data[i] = previous =
                ((data[i] ^ imul(previous ^ (previous >>> 30), 0x5d588b65)) - i) | 0;
            i = (i + 1) | 0;
            if ((i | 0) > ARRAY_MAX) {
                data[0] = data[ARRAY_MAX];
                i = 1;
            }
        }
        data[0] = INT32_SIZE;
    }

    let data$1 = null;
    const COUNT$1 = 128;
    let index$1 = COUNT$1;
    /**
     * An Engine that relies on the node-available
     * `require('crypto').randomBytes`, which has been available since 0.58.
     *
     * See https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
     *
     * If unavailable or otherwise non-functioning, then `nodeCrypto` will
     * likely `throw` on the first call to `next()`.
     */
    const nodeCrypto = {
        next() {
            if (index$1 >= COUNT$1) {
                data$1 = new Int32Array(new Int8Array(require("crypto").randomBytes(4 * COUNT$1)).buffer);
                index$1 = 0;
            }
            return data$1[index$1++] | 0;
        }
    };

    /**
     * Returns a Distribution to random value within the provided `source`
     * within the sliced bounds of `begin` and `end`.
     * @param source an array of items to pick from
     * @param begin the beginning slice index (defaults to `0`)
     * @param end the ending slice index (defaults to `source.length`)
     */
    function picker(source, begin, end) {
        const clone = sliceArray.call(source, begin, end);
        if (clone.length === 0) {
            throw new RangeError(`Cannot pick from a source with no items`);
        }
        const distribution = integer(0, clone.length - 1);
        return engine => clone[distribution(engine)];
    }

    class Object3dComponent {
        constructor(object3d = null) {
            this._object3d = object3d;
        }
        get object3d() {
            if (this._object3d === null)
                throw new Error();
            return this._object3d;
        }
        static createRawArray(capacity) {
            let empty = Object3dComponent._empty;
            if (empty === null) {
                empty = new Object3dComponent(null);
                Object3dComponent._empty = empty;
            }
            return new ObjectComponentRawArray(capacity, empty);
        }
    }
    Object3dComponent.isSystemState = true;
    Object3dComponent._empty = null;
    class Object3dSystem extends ComponentSystem {
        createUpdateFuction(world) {
            const { entityManager } = world;
            const deletedQuery = entityManager.getQuery({
                include: [Object3dComponent],
                exclude: [AliveTag],
            });
            const moveQuery = entityManager.getQuery({
                include: [Object3dComponent, Translation, AliveTag],
            });
            const postRemoveComponentSystem = world.getSystem(PostRemoveComponentSystem);
            function logicUpdate(timeInfo) {
                if (!deletedQuery.isEmptyIgnoreFilter()) {
                    for (const chunk of deletedQuery.iterChunks()) {
                        const entityArray = chunk.getEntityArray();
                        const object3dDataArray = chunk.getDataArray(Object3dComponent);
                        if (object3dDataArray === null)
                            throw new Error();
                        for (const e of entityArray) {
                            postRemoveComponentSystem.enqueue(e, Object3dComponent);
                        }
                        for (let i = 0; i < chunk.count; ++i) {
                            const object3dData = object3dDataArray.get(i);
                            object3dData.object3d.recycle();
                        }
                    }
                }
            }
            function presentUpdate(timeInfo) {
                if (!moveQuery.isEmptyIgnoreFilter()) {
                    for (const chunk of moveQuery.iterChunks()) {
                        const object3dDataArray = chunk.getDataArray(Object3dComponent);
                        const translationArray = chunk.getDataArray(Translation);
                        if (object3dDataArray === null)
                            throw new Error();
                        if (translationArray === null)
                            throw new Error();
                        for (let i = 0; i < chunk.count; ++i) {
                            const pos = translationArray.get(i);
                            object3dDataArray.get(i).object3d.setPosition(pos);
                        }
                    }
                }
            }
            return { logicUpdate, presentUpdate };
        }
    }

    class VirusTag {
        static createRawArray(capacity) {
            return new EmptyComponentRawArray(capacity, VirusTag.instance);
        }
    }
    VirusTag.instance = new VirusTag();
    class VirusSpawnSystem extends ComponentSystem {
        constructor(pool) {
            super();
            this._pool = pool;
        }
        createUpdateFuction(world) {
            const postCreateEntitySystem = world.getSystem(PostCreateEntitySystem);
            const random = new Random(MersenneTwister19937.autoSeed());
            const averageInterval = 0.1;
            const virusArchetype = world.entityManager.getArchetype(VirusTag, LineMoveComponent, Translation, Object3dComponent, DeleteAtTickComponent);
            const genNextSpawnTime = () => poissonNextTime(random.realZeroToOneExclusive()) * averageInterval;
            let nextSpawnTime = genNextSpawnTime();
            const speed = 1;
            const logicUpdate = (timeInfo) => {
                if (timeInfo.tickTime < nextSpawnTime)
                    return;
                nextSpawnTime += genNextSpawnTime();
                const p = randomPointInCircle(random.realZeroToOneExclusive(), random.realZeroToOneExclusive(), random.realZeroToOneExclusive());
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
            };
            return { logicUpdate };
        }
    }

    class Object3d {
        constructor() {
            this._poolArray = null;
            this._recycled = false;
        }
        get recycled() {
            return this._recycled;
        }
        recycle() {
            if (this._recycled)
                return;
            this.setEnable(false);
            if (this._poolArray === null)
                throw new Error();
            this._poolArray.push(this);
            this._recycled = true;
        }
    }
    Object3d.Pool = class Object3dPool {
        constructor(createFunc) {
            this._pool = new Array();
            this._createFunc = createFunc;
        }
        spawn(name = '') {
            let o;
            if (this._pool.length > 0) {
                o = this._pool.pop();
                o.setEnable(true);
            }
            else {
                o = this._createFunc(name);
                o._poolArray = this._pool;
            }
            o._recycled = false;
            return o;
        }
    };
    class Object3dPool extends Object3d.Pool {
    }

    class Script3dObject extends Object3d {
        constructor(prefab, scene3d) {
            super();
            this._scene3d = scene3d;
            this._sprite3d = Laya.Sprite3D.instantiate(prefab, scene3d);
        }
        setEnable(enabled) {
            if (enabled)
                this._scene3d.addChild(this._sprite3d);
            else
                this._sprite3d.removeSelf();
        }
        setPosition({ x, y, z }) {
            this._sprite3d.transform.position = new Laya.Vector3(x, y, z);
        }
    }

    class BulletTag {
        static createRawArray(capacity) {
            return new EmptyComponentRawArray(capacity, BulletTag.instance);
        }
    }
    BulletTag.instance = new BulletTag();
    const bulletSpeed = 5;
    const bulletLifeTime = 5;
    const shootTickInterval = 2;
    class BulletSpawnSystem extends ComponentSystem {
        constructor(pool) {
            super();
            this._velocity = new Laya.Vector3();
            this._pool = pool;
        }
        setShootDirection(direction) {
            Laya.Vector3.normalize(direction, this._velocity);
            Laya.Vector3.scale(this._velocity, bulletSpeed, this._velocity);
        }
        createUpdateFuction(world) {
            const postCreateEntitySystem = world.getSystem(PostCreateEntitySystem);
            const bulletArchetype = world.entityManager.getArchetype(BulletTag, LineMoveComponent, Translation, Object3dComponent, DeleteAtTickComponent);
            let nextShootTick;
            const logicUpdate = (timeInfo) => {
                if (nextShootTick === undefined) {
                    nextShootTick = timeInfo.tick + shootTickInterval;
                    return;
                }
                if (timeInfo.tick <= nextShootTick) {
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
            };
            return { logicUpdate };
        }
    }

    const collideDist2 = 0.2 * 0.2;
    class CollideSystem extends ComponentSystem {
        createUpdateFuction(world) {
            const { entityManager } = world;
            const virusQuery = entityManager.getQuery({
                include: [VirusTag, Translation],
            });
            const bulletQuery = entityManager.getQuery({
                include: [BulletTag, Translation],
            });
            const postDeleteEntitySystem = world.getSystem(PostDeleteEntitySystem);
            function logicUpdate() {
                if (virusQuery.isEmptyIgnoreFilter() || bulletQuery.isEmptyIgnoreFilter()) {
                    return;
                }
                for (const virusChunk of virusQuery.iterChunks()) {
                    const virusEntityArray = virusChunk.getEntityArray();
                    const virusTranslationArray = virusChunk.getDataArray(Translation);
                    if (virusTranslationArray === null)
                        throw new Error();
                    for (const bulletChunk of bulletQuery.iterChunks()) {
                        const bulletEntityArray = bulletChunk.getEntityArray();
                        const bulletTranslationArray = bulletChunk.getDataArray(Translation);
                        if (bulletTranslationArray === null)
                            throw new Error();
                        for (let vi = 0; vi < virusChunk.count; ++vi) {
                            const virusPos = virusTranslationArray.get(vi);
                            for (let bi = 0; bi < bulletChunk.count; ++bi) {
                                const bulletPos = bulletTranslationArray.get(bi);
                                const dx = virusPos.x - bulletPos.x;
                                const dy = virusPos.y - bulletPos.y;
                                const dz = virusPos.z - bulletPos.z;
                                const d2 = dx * dx + dy * dy + dz * dz;
                                if (d2 <= collideDist2) {
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

    function createGame(scene3d, virusPrefab, bulletPrefab) {
        const virusPool = new Object3dPool(() => new Script3dObject(virusPrefab, scene3d));
        const bulletPool = new Object3dPool(() => new Script3dObject(bulletPrefab, scene3d));
        const bulletSpawnSystem = new BulletSpawnSystem(bulletPool);
        const systems = new Array();
        systems.push(new VirusSpawnSystem(virusPool), bulletSpawnSystem, new LineMoveSystem(), new CollideSystem(), new DeleteAtTickSystem(), new PostRemoveComponentSystem(), new PostCreateEntitySystem(), new PostDeleteEntitySystem(), new Object3dSystem());
        const world = new World(systems);
        return {
            update(time) {
                world.update(time);
            },
            setShootDirection(direction) {
                bulletSpawnSystem.setShootDirection(direction);
            },
        };
    }

    var Scene = Laya.Scene;
    var Scene3D = Laya.Scene3D;
    var Camera = Laya.Camera;
    var Vector3 = Laya.Vector3;
    var DirectionLight = Laya.DirectionLight;
    var MeshSprite3D = Laya.MeshSprite3D;
    var BlinnPhongMaterial = Laya.BlinnPhongMaterial;
    var PrimitiveMesh = Laya.PrimitiveMesh;
    var Texture2D = Laya.Texture2D;
    var Handler = Laya.Handler;
    class Shooting extends Scene {
        constructor() {
            super();
            const scene3d = Laya.stage.addChild(new Scene3D());
            const camera = new Camera(0, 0.01, 40);
            scene3d.addChild(camera);
            scene3d.enableFog = true;
            scene3d.fogStart = 3;
            scene3d.fogRange = 20;
            const directionLight = new DirectionLight();
            scene3d.addChild(directionLight);
            directionLight.color = new Vector3(0.6, 0.6, 0.6);
            const mat = directionLight.transform.worldMatrix;
            mat.setForward(new Vector3(-1, -1, -1));
            directionLight.transform.worldMatrix = mat;
            const plane = new MeshSprite3D(PrimitiveMesh.createPlane(10, 10, 10, 10));
            scene3d.addChild(plane);
            const planeMat = new BlinnPhongMaterial();
            Texture2D.load("res/grass.png", Handler.create(this, (tex) => planeMat.albedoTexture = tex));
            {
                const tilingOffset = planeMat.tilingOffset;
                tilingOffset.setValue(5, 5, 0, 0);
                planeMat.tilingOffset = tilingOffset;
                plane.meshRenderer.material = planeMat;
            }
            plane.transform.translate(new Vector3(0, -1.5, 0));
            const virus = new MeshSprite3D(PrimitiveMesh.createSphere(0.1, 4, 8));
            {
                const mat = new BlinnPhongMaterial();
                Texture2D.load("res/wood.jpg", Handler.create(this, (tex) => mat.albedoTexture = tex));
                const tilingOffset = mat.tilingOffset;
                tilingOffset.setValue(5, 5, 0, 0);
                mat.tilingOffset = tilingOffset;
                virus.meshRenderer.material = mat;
            }
            const bullet = new MeshSprite3D(PrimitiveMesh.createSphere(0.1, 6, 12));
            {
                const mat = new BlinnPhongMaterial();
                Texture2D.load("res/fabric_wool.jpg", Handler.create(this, (tex) => mat.albedoTexture = tex));
                bullet.meshRenderer.material = mat;
            }
            const game = createGame(scene3d, virus, bullet);
            game.setShootDirection(new Laya.Vector3(0, 0, -1));
            function mainLoop() {
                const t = Laya.timer.currTimer * 0.001;
                game.update(t);
            }
            Laya.timer.frameLoop(1, this, mainLoop);
            {
                let inDrag = false;
                const lastDragPos = new Laya.Vector2();
                const cameraRotationEuler = new Vector3();
                const tmpVector3 = new Vector3();
                function onMouseDown(e) {
                    e.stopPropagation();
                    lastDragPos.x = e.stageX;
                    lastDragPos.y = e.stageY;
                    inDrag = true;
                }
                function onMouseMove(e) {
                    e.stopPropagation();
                    if (!inDrag)
                        return;
                    const dx = e.stageX - lastDragPos.x;
                    const dy = e.stageY - lastDragPos.y;
                    lastDragPos.x = e.stageX;
                    lastDragPos.y = e.stageY;
                    cameraRotationEuler.x -= dy * 0.2;
                    cameraRotationEuler.y -= dx * 0.2;
                    camera.transform.rotationEuler = cameraRotationEuler;
                    camera.transform.getForward(tmpVector3);
                    game.setShootDirection(tmpVector3);
                }
                function onMouseUp(e) {
                    e.stopPropagation();
                    inDrag = false;
                }
                Laya.stage.on(Laya.Event.MOUSE_DOWN, this, onMouseDown);
                Laya.stage.on(Laya.Event.MOUSE_MOVE, this, onMouseMove);
                Laya.stage.on(Laya.Event.MOUSE_UP, this, onMouseUp);
                let lastBeta;
                let lastGama;
                function onOrientationChange(absolute, info) {
                    if (lastBeta == undefined || lastGama == undefined) {
                        console.log('onOrientationChange', absolute, info);
                        Laya.Log.print(`onOrientationChange ${absolute} ${info.beta} ${info.gamma}`);
                        lastBeta = info.beta;
                        lastGama = info.gamma;
                        return;
                    }
                    const db = info.beta - lastBeta;
                    const dg = info.gamma - lastGama;
                    lastBeta = info.beta;
                    lastGama = info.gamma;
                    cameraRotationEuler.x += db;
                    cameraRotationEuler.y += dg * 3;
                    camera.transform.rotationEuler = cameraRotationEuler;
                    camera.transform.getForward(tmpVector3);
                    game.setShootDirection(tmpVector3);
                }
                Laya.Log.enable();
                Laya.Log.toggle();
                Laya.Gyroscope.instance.on(Laya.Event.CHANGE, this, onOrientationChange);
            }
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("scenes/Shooting.ts", Shooting);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "Shooting.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError = true;
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());
