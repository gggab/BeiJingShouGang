import { createScopedThreejs } from 'threejs-miniprogram'
import { registerGLTFLoader } from '../../loaders/gltf-loader'
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
        renderer.autoClearColor = false
        renderer.state.setCullFace(THREE.CullFaceNone)

        this.clock = new THREE.Clock();

        this.yuvBehavior = new yuvBehavior(renderer);
        this.yuvBehavior.initGL();

        this.setProjectOnce = true;
        this.models = [];
        this.animations = [];
        this.playing = false;
        this._isReadied = false;
    }
    get camera() {
        return this._camera;
    }
    get isReadied() {
        return this._isReadied;
    }
    set isReadied(value) {
        this._isReadied = value
    }
    render(frame, clsWorldMatrix) {
        this.yuvBehavior.renderGL(frame);

        const camera = frame.camera;

        // 相机
        if (camera) {
            this.camera.matrixAutoUpdate = false
            if (!clsWorldMatrix) {
                this.camera.matrixWorldInverse.fromArray(camera.viewMatrix)
                this.camera.matrixWorld.getInverse(this.camera.matrixWorldInverse)
            } else {
                // console.log('云识别到了')
                this.camera.matrixWorld.fromArray(clsWorldMatrix);
                this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
                this.play();
            }
            const projectionMatrix = camera.getProjectionMatrix(0.1, 100000)
            this.camera.projectionMatrix.fromArray(projectionMatrix)
            this.camera.projectionMatrixInverse.getInverse(this.camera.projectionMatrix)
            // this.setProjectOnce = false;
            // if (this.setProjectOnce) {
            //     console.log(this.camera.projectionMatrix);
            // }
        }
        if (this.playing) {
            // 更新动画
            this.updateAnimation();
        }
        
        this.renderer.render(this.scene, this.camera)
        
    }
    setProjectionMatrix(matrix) {
        // this._camera.projectionMatrix.fromArray(matrix);
    }
    setWorldMatrix(matrix) {
        // this._camera.matrixWorld.fromArray(matrix);
    }
    play() {
        // 等待所有模型准备好，同时云识别定位成功在开始播放
        if (this.playing || !this._isReadied) {
            return;
        }
        this.playing = true;
        this.models.forEach(model => {
            this.scene.add(model);
        })
        this.animations.forEach(element => {
            element.play();
        });
    }
    // 加载一个gltf模型
    async loadModel(url) {
        return new Promise((resolve, reject) => {
            const loader = new this.THREE.GLTFLoader();
            loader.load(url, gltf => {
                const scene = gltf.scene;
                const animations = gltf.animations;
                const mixer = new this.THREE.AnimationMixer(scene);
                for (let i = 0; i < animations.length; i++) {
                    const clip = animations[i]
                    console.log(clip.name);
                }
                if (animations.length >= 1) {
                    const clip = animations[0];
                    const action = mixer.clipAction(clip);
                    action.setLoop(this.THREE.LoopOnce);
                    // action.play();
                    this.animations.push(action);
                }
                scene._mixer = mixer;
                this.mixers = this.mixers || [];
                this.mixers.push(mixer);
                this.models.push(scene);
                // this.scene.add(scene);
                resolve();
            })
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