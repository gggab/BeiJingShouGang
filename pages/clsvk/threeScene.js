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
    }
}