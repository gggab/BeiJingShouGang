import {createScopedThreejs} from 'threejs-miniprogram'
import {registerGLTFLoader} from '../../loaders/gltf-loader'
import cloneGltf from '../../loaders/gltf-clone'
export class threeScene {
    constructor(canvas) {
        // this._canvas = canvas;
        // this._scene = new THREE.Scene();
        // this._camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
        // this._renderer = new THREE.WebGLRenderer({ canvas: canvas });
        // this._renderer.setSize(canvas.width, canvas.height);
        // this._geometry = new THREE.BoxGeometry(1, 1, 1);
        // this._material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // this._cube = new THREE.Mesh(this._geometry, this._material);
        // this._scene.add(this._cube);
        // this._camera.position.z = 5;

        const THREE = this.THREE = createScopedThreejs(canvas);
        registerGLTFLoader(THREE);
        // 相机
        this._camera = new THREE.Camera()

        // 场景
        const scene = this.scene = new THREE.Scene()

        // // 光源
        // const light1 = new THREE.HemisphereLight(0xffffff, 0x444444) // 半球光
        // light1.position.set(0, 0.2, 0)
        // scene.add(light1)
        const light2 = new THREE.DirectionalLight(0xffffff) // 平行光
        light2.position.set(0, 0.2, 0.1)
        scene.add(light2)

        // 渲染层
        const renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.gammaOutput = true
        renderer.gammaFactor = 2.2
        console.log('999999999999')
    }
    get camera() {
        return this._camera;
    }
    setProjectionMatrix(matrix) {
        // this._camera.projectionMatrix.fromArray(matrix);
    }
    setWorldMatrix(matrix) {
        // this._camera.matrixWorld.fromArray(matrix);
    }
    // 加载一个gltf模型
    async loadModel(url) {
        // const loader = new THREE.GLTFLoader();
        // const gltf = await loader.loadAsync(url);
        // this._scene.add(gltf.scene);
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
          if (this.camera) this.camera = null
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
    }
}