import { createScopedThreejs } from 'threejs-miniprogram'
import { registerGLTFLoader } from '../../loaders/gltf-loader'
import cloneGltf from '../../loaders/gltf-clone'
import { yuvBehavior } from './yuvBehavior';
export class threeScene {
    constructor(canvas) {
        const THREE = this.THREE = createScopedThreejs(canvas);
        registerGLTFLoader(THREE);
        // 相机
        this._camera = new THREE.Camera()

        // 场景
        const scene = this.scene = new THREE.Scene()

        // 光源
        // const light1 = new THREE.HemisphereLight(0xffffff, 0x444444) // 半球光
        // light1.position.set(0, 0.2, 0)
        // scene.add(light1)
        // const light2 = new THREE.DirectionalLight(0xffffff) // 平行光
        // light2.position.set(0, 0.2, 0.1)
        // scene.add(light2)
        // 创建环境光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

        // 添加到场景中
        scene.add(ambientLight);

        // 渲染层
        const renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.gammaOutput = true
        renderer.gammaFactor = 2.2
        // renderer.setDepthTest(true);

        this.clock = new THREE.Clock();

        this.yuvBehavior = new yuvBehavior(renderer);
        this.yuvBehavior.initGL();
    }
    get camera() {
        return this._camera;
    }
    render(frame, clsWorldMatrix) {
        this.yuvBehavior.renderGL(frame);

        const camera = frame.camera;

        // 更新动画
        this.updateAnimation();

        // 相机
        if (camera) {
            this.camera.matrixAutoUpdate = false
            if (!clsWorldMatrix) {
                this.camera.matrixWorldInverse.fromArray(camera.viewMatrix)
                this.camera.matrixWorld.getInverse(this.camera.matrixWorldInverse)
            } else {
                this.camera.matrixWorld.fromArray(clsWorldMatrix);
                this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
            }

            const projectionMatrix = camera.getProjectionMatrix(0.01, 1000)
            this.camera.projectionMatrix.fromArray(projectionMatrix)
            this.camera.projectionMatrixInverse.getInverse(this.camera.projectionMatrix)
        }

        this.renderer.autoClearColor = false
        this.renderer.render(this.scene, this.camera)
        this.renderer.state.setCullFace(this.THREE.CullFaceNone)
    }
    setProjectionMatrix(matrix) {
        // this._camera.projectionMatrix.fromArray(matrix);
    }
    setWorldMatrix(matrix) {
        // this._camera.matrixWorld.fromArray(matrix);
    }
    // 加载一个gltf模型
    async loadModel(url) {
        const loader = new this.THREE.GLTFLoader();
        loader.load(url, gltf => {
            this.model = {
                scene: gltf.scene,
                animations: gltf.animations
            }
            const {scene, animations} = cloneGltf(this.model, this.THREE)
            const mixer = new this.THREE.AnimationMixer(scene);
            for (let i = 0; i < animations.length; i++) {
                const clip = animations[i]
                console.log(clip.name);
                // if (clip.name === 'Dance') {
                //     const action = mixer.clipAction(clip)
                //     action.play()
                // }
            }
            if (animations.length >= 1) {
                const clip = animations[0];
                const action = mixer.clipAction(clip);
                action.play();
            }
            scene._mixer = mixer;
            this.mixers = this.mixers || [];
            this.mixers.push(mixer);

            const model = new this.THREE.Object3D()
            model.add(scene)
            this.scene.add(model);
            // const model = this.model = gltf.scene
            // model.matrixAutoUpdate = false
            // model.position.set(0, 0, -0.5)
            // model.scale.set(0.01, 0.01, 0.01)
            // this.scene.add(model)
        })
    }
    updateAnimation() {
        const dt = this.clock.getDelta()
        if (this.mixers) this.mixers.forEach(mixer => mixer.update(dt))
    }
    // 外部调用每帧调用，渲染一帧的场景
    updateScene() {
        // this._renderer.render(this._scene, this._camera);
    }
    // 销毁场景
    destroyScene() {
        // this._scene.remove(this._cube);
        // this._geometry.dispose();
        // this._material.dispose();
        // this._renderer.dispose();

        if (this.renderer) {
            this.renderer.dispose()
            this.renderer = null
        }
        if (this.scene) {
            this.scene.dispose()
            this.scene = null
        }
        if (this._camera) this._camera = null
        if (this.model) this.model = null
        if (this._insertModels) this._insertModels = null
        if (this.planeBox) this.planeBox = null
        if (this.mixers) {
            this.mixers.forEach(mixer => mixer.uncacheRoot(mixer.getRoot()))
            this.mixers = null
        }
        if (this.clock) this.clock = null

        if (this.THREE) this.THREE = null
        if (this.canvas) this.canvas = null
        if (this.session) this.session = null
        if (this.yuvBehavior) this.yuvBehavior.destroy()
    }
}