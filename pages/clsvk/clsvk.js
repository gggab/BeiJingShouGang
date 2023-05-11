import {createScopedThreejs} from '../../threejs-miniprogram/index'
import {registerGLTFLoader} from '../../loaders/gltf-loader'
// import cloneGltf from '../../loaders/gltf-clone'

const sysInfo = wx.getSystemInfoSync();

Page({
  data: {
    wxapi: wx,
    canvasW: sysInfo.windowWidth,
    canvasH: sysInfo.windowHeight,
    canvasT: 0,
    canvasL: 0,
    // 是否显示左上角的调试信息
    showDebugPanel: false,
    // xlzUrl: "https://ball.forgenius.cn/LQXLZ/LQ00.png",
    xlz: 0,
    progress: 0,
    showLoading: true,
    // // 新园区
    // clsConfig: {
    //   apiKey: "da795ff1828d676dab9aaf9c018fe6eb",
    //   apiSecret: "4e34c727701c60ba10435d628c485137564e932b6dd50983389894b9d8ffdade",
    //   clsAppId: "98e15642624043b7992e70c862818b24",
    //   arannotationId: "8233a115b0857f2d46d1bb18aaf60b75"
    // },
    // 首钢
    clsConfig: {
      apiKey: "c35172addcdff7780f4ca593b38520c7",
      apiSecret: "fb4c0a2f89cf64dc7cf2a63a7c5472029a05213e22688a3cc443a7dc39d227d9",
      clsAppId: "e51e02c9d50a45af9a3c1b39bb8852cc",
      arannotationId: "77c4a106e869c9a07dc941efb3bad19a"
    },

    cameraWidth: `${sysInfo.windowWidth}px`,
    cameraHeight: `${sysInfo.windowHeight * 0.8}px`,
    width: sysInfo.windowWidth,
    height: sysInfo.windowHeight*0.98,

    running: true,
    minInterval: 3000, // 识别间隔
    // motion: true,
    // showScan: false,
    load3d: false,

    projectUrl: 'https://ball.forgenius.cn/PlayBasketball_0507_3',
    sceneFileName: '1729120.json',
    // projectUrl: 'https://sightp-tour-cdn.sightp.com/wxapp/apps/Test/pdrjy_office_v1',
    // sceneFileName: '1434681.json',
    enhanceDevtools: sysInfo.platform === 'devtools',
    // loadScripts,
    // loadNetworkScripts: {},
  },
  onLoad: function (options) {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
    this.setData({ load3d: true });
    let index = 0;
    setInterval(() => {
      // let indexStr = index < 10 ? '0' + index : index.toString();
      // let url = `https://ball.forgenius.cn/LQXLZ/LQ${indexStr}.png`;
      // this.setData({xlzUrl:url})
      index++
      index = index % 31;
      this.setData({ xlz: index })
    }, 34);
  },
  onUnload() {
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
    if (this._program && this._program.gl) {
      this._program.gl.deleteProgram(this._program)
      this._program = null
    }
    if (this.canvas) this.canvas = null
    if (this.session) this.session = null
  },
  onReady() {
    wx.createSelectorQuery()
      .select('#webgl')
      .node()
      .exec(res => {
        this.canvas = res[0].node
        this.initTHREE();
        this.initGL();
      })
  },
  initTHREE() {
    const THREE = this.THREE = createScopedThreejs(this.canvas)
    registerGLTFLoader(THREE)
  
    // 相机
    this.camera = new THREE.Camera()
  
    // 场景
    const scene = this.scene = new THREE.Scene()

    // 光源
    const light1 = new THREE.HemisphereLight(0xffffff, 0x444444) // 半球光
    light1.position.set(0, 0.2, 0)
    scene.add(light1)
    const light2 = new THREE.DirectionalLight(0xffffff) // 平行光
    light2.position.set(0, 0.2, 0.1)
    scene.add(light2)

    // 渲染层
    const renderer = this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
    renderer.gammaOutput = true
    renderer.gammaFactor = 2.2
  },
  initGL() {
    this.initShader()
    this.initVAO()
  },
  initShader() {
    const gl = this.renderer.getContext()
    const currentProgram = gl.getParameter(gl.CURRENT_PROGRAM)
    const vs = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      uniform mat3 displayTransform;
      varying vec2 v_texCoord;
      void main() {
        vec3 p = displayTransform * vec3(a_position, 0);
        gl_Position = vec4(p, 1);
        v_texCoord = a_texCoord;
      }
    `
    const fs = `
      precision highp float;

      uniform sampler2D y_texture;
      uniform sampler2D uv_texture;
      varying vec2 v_texCoord;
      void main() {
        vec4 y_color = texture2D(y_texture, v_texCoord);
        vec4 uv_color = texture2D(uv_texture, v_texCoord);

        float Y, U, V;
        float R ,G, B;
        Y = y_color.r;
        U = uv_color.r - 0.5;
        V = uv_color.a - 0.5;
        
        R = Y + 1.402 * V;
        G = Y - 0.344 * U - 0.714 * V;
        B = Y + 1.772 * U;
        
        gl_FragColor = vec4(R, G, B, 1.0);
      }
    `
    const vertShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertShader, vs)
    gl.compileShader(vertShader)

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragShader, fs)
    gl.compileShader(fragShader)

    const program = this._program = gl.createProgram()
    this._program.gl = gl
    gl.attachShader(program, vertShader)
    gl.attachShader(program, fragShader)
    gl.deleteShader(vertShader)
    gl.deleteShader(fragShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    const uniformYTexture = gl.getUniformLocation(program, 'y_texture')
    gl.uniform1i(uniformYTexture, 5)
    const uniformUVTexture = gl.getUniformLocation(program, 'uv_texture')
    gl.uniform1i(uniformUVTexture, 6)

    this._dt = gl.getUniformLocation(program, 'displayTransform')
    gl.useProgram(currentProgram)
  },
  initVAO() {
    const gl = this.renderer.getContext()
    const ext = gl.getExtension('OES_vertex_array_object')
    this._vao_ext = ext

    const currentVAO = gl.getParameter(gl.VERTEX_ARRAY_BINDING)
    const vao = ext.createVertexArrayOES()
    
    ext.bindVertexArrayOES(vao)

    const posAttr = gl.getAttribLocation(this._program, 'a_position')
    const pos = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, pos)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 1, -1, 1, 1, -1, -1, -1]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(posAttr)
    vao.posBuffer = pos

    const texcoordAttr = gl.getAttribLocation(this._program, 'a_texCoord')
    const texcoord = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoord)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 1, 0, 1, 1, 0, 0, 0]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(texcoordAttr, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(texcoordAttr)
    vao.texcoordBuffer = texcoord

    ext.bindVertexArrayOES(currentVAO)
    this._vao = vao
  },
  renderGL(frame) {
    const gl = this.renderer.getContext()
    gl.disable(gl.DEPTH_TEST)
    const {yTexture, uvTexture} = frame.getCameraTexture(gl, 'yuv')
    const displayTransform = frame.getDisplayTransform()
    if (yTexture && uvTexture) {
      const currentProgram = gl.getParameter(gl.CURRENT_PROGRAM)
      const currentActiveTexture = gl.getParameter(gl.ACTIVE_TEXTURE)
      const currentVAO = gl.getParameter(gl.VERTEX_ARRAY_BINDING)

      gl.useProgram(this._program)
      this._vao_ext.bindVertexArrayOES(this._vao)

      gl.uniformMatrix3fv(this._dt, false, displayTransform)
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)

      gl.activeTexture(gl.TEXTURE0 + 5)
      const bindingTexture5 = gl.getParameter(gl.TEXTURE_BINDING_2D)
      gl.bindTexture(gl.TEXTURE_2D, yTexture)

      gl.activeTexture(gl.TEXTURE0 + 6)
      const bindingTexture6 = gl.getParameter(gl.TEXTURE_BINDING_2D)
      gl.bindTexture(gl.TEXTURE_2D, uvTexture)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      gl.bindTexture(gl.TEXTURE_2D, bindingTexture6)
      gl.activeTexture(gl.TEXTURE0 + 5)
      gl.bindTexture(gl.TEXTURE_2D, bindingTexture5)

      gl.useProgram(currentProgram)
      gl.activeTexture(currentActiveTexture)
      this._vao_ext.bindVertexArrayOES(currentVAO)
    }
  },
  pause() {
    this.setData({ running: false });
  },
  resume() {
    this.setData({ running: true });
  },

  onClsClientLoad(e) {
    let { clsClientContext, VKSessionContext, clsVKCameraContext } = e.detail;
    this.clsclient = e.detail.clsClientContext;
    // this.clsVKCameraContext = clsVKCameraContext;
    this.vkCtx = VKSessionContext;
    // console.log("onClsClientLoad", clsClientContext, VKSessionContext);
    VKSessionContext.VKUpdate = this.onVKUpdate;
    VKSessionContext.stableDetector.registerStableChange((value) => {
      if (value) {
        console.log('clsVK is stable');
      } else {
        console.log('clsVK is not stable');
      }
    });
    // this.threeScene = new threeScene(VKSessionContext.self.cameraCanvas);
  },
  // onClsClientLoad(e) {
  //   let { clsClientContext, clsCameraContext } = e.detail;
  //   this.clsclient = e.detail.clsClientContext;
  //   // console.log("onClsClientLoad", clsClientContext, clsCameraContext);
  // },
  onResize(e) {
    this.setData(e.detail);
  },
  once() {
    if (this.clsclient) {
      let canRun = false
      if (canRun = this.clsclient.run()) {
        console.log('running', canRun)
      }
    }
  },
  /**
   * 
   * @param {*} e.deail:
   * {
   *    timestamp:number,
   *    frame:vkFrame,
   *    vkCamera:vkCamera,
   *    vkCameraPose:Array[16],
   *    clsCameraPose:Array[16]
   * }
   */
  onVKUpdate(e) {
    let data = e;//.detail;
    // console.log('88888888888')
    this.renderGL(data.frame);
    // 开启下面的逻辑就会必然卡死 感觉是性能不够
    // const camera = data.frame.camera

    // // 相机
    // if (camera) {
    //   this.camera.matrixAutoUpdate = false
    //   this.camera.matrixWorldInverse.fromArray(camera.viewMatrix)
    //   this.camera.matrixWorld.getInverse(this.camera.matrixWorldInverse)

    //   const projectionMatrix = camera.getProjectionMatrix(NEAR, FAR)
    //   this.camera.projectionMatrix.fromArray(projectionMatrix)
    //   this.camera.projectionMatrixInverse.getInverse(this.camera.projectionMatrix)
    // }

    // this.renderer.autoClearColor = false
    // this.renderer.render(this.scene, this.camera)
    // this.renderer.state.setCullFace(this.THREE.CullFaceNone)


    // if (this._app3d && this._camera3d && this._camera3d.camera) {
    //   // console.log('7777777777777')
    //   const projectionMatrix = data.vkCamera.getProjectionMatrix(this._camera3d.camera.nearClip, this._camera3d.camera.farClip);
    //   let vp = new this._pc.Mat4().set(projectionMatrix);
    //   this._camera3d.camera.projectionMatrix.set(vp.data);

    //   if (data.clsCameraPose) {
    //     this._camera3d.worldTransform.set(data.clsCameraPose);
    //   } else {
    //     this._camera3d.worldTransform.set(data.vkCameraPose);
    //   }
    // }
  },
  // onClsClientResult(e) {
  //   // console.log("onClsClientResult", e.detail);
  //   this.setData({
  //     result: e.detail.msg,
  //     count: this.data.count + 1
  //   });
  // },
  onClsClientResult(e) {
    if (e.detail.statusCode == 0) {
      // console.log("onClsClientResult", e.detail);
      // 识别成功
    } else {
      // console.log('当前设备朝向是否适合cls:', this.vkCtx.stableDetector.isSuitForCls);
    }
  },
  onClsClientError(e) {
    // console.log("onClsClientError", e.detail);
    this.setData({
      error: e.detail,
    });
  },
  on3dLoadProgress: function (progress) {
    // console.log(progress.detail.progress);
    if (!this.prog) {
      this.prog = 0;
    }
    if (progress.detail.progress) {
      this.prog = (progress.detail.progress * 100).toFixed(0);
    }
    this.setData({
      progress: this.prog
    })
  },
  on3dError: function (e) {
    console.error(e);
  },
  on3dLoad: function (arg) {
    console.log('3d Loaded');
    this.setData({ showLoading: false });

    this._pc = arg.detail.pc;
    this._app3d = arg.detail.app;
    this._app3d.graphicsDevice.maxPixelRatio = 2;
    this._camera3d = arg.detail.camera;
    this._canvas3d = arg.detail.canvas;
    this._gl = arg.detail.app.graphicsDevice.gl;

    this.vkCtx?.setApp3d(this._app3d);

    // if (!this.annitations) {
    //   this._app3d.on("setAnnotation", (annitations) => {
    //     annitations.forEach(anno => {
    //       let cube = new this._pc.Entity();
    //       cube.addComponent("model", {
    //         type: "box"
    //       })
    //       let p = anno.transform.position;
    //       let r = anno.transform.rotation;
    //       let s = anno.transform.scale;
    //       cube.setLocalPosition(p.x, p.y, p.z);
    //       cube.setLocalRotation(r.x, r.y, r.z, r.w);
    //       cube.setLocalScale(s.x, s.y, s.z);
    //     })
    //   })
    // }
    // if (this.annitations) {
    //   this.annitations.forEach(anno => {
    //     let cube = new this._pc.Entity();
    //     cube.addComponent("model", {
    //       type: "box"
    //     })
    //     let p = anno.transform.position;
    //     let r = anno.transform.rotation;
    //     let s = anno.transform.scale;
    //     cube.setLocalPosition(p.x, p.y, p.z);
    //     cube.setLocalRotation(r.x, r.y, r.z, r.w);
    //     cube.setLocalScale(s.x, s.y, s.z);
    //   })
    // }
    this.setData({ running: true });
  },
  // preview() {
  //   wx.previewImage({ urls: ["https://mp.easyar.cn/artravel/puruan_scan_sample.jpg"] });
  // },
  // dismiss() {
  //   this.setData({ showScan: false });
  // },
});