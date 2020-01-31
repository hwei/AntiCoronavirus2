import Scene = Laya.Scene;
import Scene3D = Laya.Scene3D;
import Camera = Laya.Camera;
import Vector3 = Laya.Vector3;
import DirectionLight = Laya.DirectionLight;
import MeshSprite3D = Laya.MeshSprite3D;
import BlinnPhongMaterial = Laya.BlinnPhongMaterial;
import PrimitiveMesh = Laya.PrimitiveMesh;
import Texture2D = Laya.Texture2D;
import Handler = Laya.Handler;
import * as ShootingGame from "../ShootingGame";

export default class Shooting extends Scene {

    constructor() {
        super();

        const scene3d = Laya.stage.addChild(new Scene3D()) as Scene3D;

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
        Texture2D.load("res/grass.png", Handler.create(
            this, (tex: Texture2D) => planeMat.albedoTexture = tex));
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
            Texture2D.load("res/wood.jpg", Handler.create(
                this, (tex: Texture2D) => mat.albedoTexture = tex));
            const tilingOffset = mat.tilingOffset;
            tilingOffset.setValue(5, 5, 0, 0);
            mat.tilingOffset = tilingOffset;
            virus.meshRenderer.material = mat;
        }
        const bullet = new MeshSprite3D(PrimitiveMesh.createSphere(0.1, 6, 12));
        {
            const mat = new BlinnPhongMaterial();
            Texture2D.load("res/fabric_wool.jpg", Handler.create(
                this, (tex: Texture2D) => mat.albedoTexture = tex));
            bullet.meshRenderer.material = mat;
        }

        const game = ShootingGame.createGame(scene3d, virus, bullet);
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
            function onMouseDown(e: Laya.Event) {
                e.stopPropagation();
                lastDragPos.x = e.stageX;
                lastDragPos.y = e.stageY;
                inDrag = true;
            }
            function onMouseMove(e: Laya.Event) {
                e.stopPropagation();
    
                if(!inDrag)
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
            function onMouseUp(e: Laya.Event) {
                e.stopPropagation();
                inDrag = false;
            }
    
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, onMouseDown);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, onMouseMove);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, onMouseUp);

            let lastBeta: number | undefined;
            let lastGama: number | undefined;
            function onOrientationChange(absolute: Boolean, info: laya.device.motion.RotationInfo) {
                if(lastBeta == undefined || lastGama == undefined) {
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