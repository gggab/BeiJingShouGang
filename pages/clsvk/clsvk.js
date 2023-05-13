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
    progress: 0,
    showLoading: true,

    // 首钢
    clsConfig: {
      apiKey: "c35172addcdff7780f4ca593b38520c7",
      apiSecret: "fb4c0a2f89cf64dc7cf2a63a7c5472029a05213e22688a3cc443a7dc39d227d9",
      clsAppId: "991ab00f63ec44c6bb6282da36b969eb",
      arannotationId: "123401934e71bd6663d47495dcf7ba14"
    },

    cameraWidth: `${sysInfo.windowWidth}px`,
    cameraHeight: `${sysInfo.windowHeight * 0.8}px`,

    running: true,
    minInterval: 3000, // 识别间隔
    showScan: false,
    load3d: false,
    playingAnimation: false,

    projectUrl: 'https://ball.forgenius.cn/PlayBasketball_0513_7',
    sceneFileName: '1729120.json',
    // enhanceDevtools: sysInfo.platform === 'devtools',
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
  },
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
    if (this._app3d && this._camera3d && this._camera3d.camera) {
      const projectionMatrix = data.vkCamera.getProjectionMatrix(this._camera3d.camera.nearClip, this._camera3d.camera.farClip);
      let vp = new this._pc.Mat4().set(projectionMatrix);
      this._camera3d.camera.projectionMatrix.set(vp.data);

      if (data.clsCameraPose) {
        this.play();
        // this._camera3d.worldTransform.set(data.clsCameraPose);
        let mat4 = new this._pc.Mat4().set(data.clsCameraPose);
        let p = mat4.getTranslation();
        let e = mat4.getEulerAngles();
        let s = mat4.getScale();
        this._camera3d.setPosition(p);
        this._camera3d.setEulerAngles(e);
        this._camera3d.setLocalScale(s);
      } else {
        // this._camera3d.worldTransform.set(data.vkCameraPose);
        console.log(data.vkCameraPose)
        let mat4 = new this._pc.Mat4().set(data.vkCameraPose);
        console.log(mat4);
        let p = mat4.getTranslation();
        let e = mat4.getEulerAngles();
        let s = mat4.getScale();
        this._camera3d.setPosition(p);
        this._camera3d.setEulerAngles(e);
        this._camera3d.setLocalScale(s);

      }
    }
  },
  // 控制动画播放
  play() {
    if (!this.data.playingAnimation) return;
    let isAnimationEnd = false; //动画是否结束
    this._entitys.forEach(entity => {
      entity.enabled = true;
      const rate = entity.animation.currentTime / entity.animation.duration;// 计算动画播放进度
      isAnimationEnd = rate > 0.99 ? true : false; // 比例大于0.99视为结束
    })
    if (isAnimationEnd) {
      // console.log('动画都结束啦');
      this.setData({
        playingAnimation: false,
        showFinal: true
      })
    }
  },
  onClsClientResult(e) {
    if (e.detail.statusCode == 0) {
      if (!this.firstLocalized) {
        this.firstLocalized = true;
        this.setData({
          playingAnimation: true
        });
        setTimeout(() => {
          this.setData({
            showScan:false
          })
        }, 1000);
      }
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
    this.setData({ 
      showLoading: false,
      showScan: true
     });

    this._pc = arg.detail.pc;
    this._app3d = arg.detail.app;
    this._app3d.graphicsDevice.maxPixelRatio = 2;
    this._camera3d = arg.detail.camera;
    this._canvas3d = arg.detail.canvas;
    this._gl = arg.detail.app.graphicsDevice.gl;

    this.vkCtx?.setApp3d(this._app3d);

    this._entitys = [];
    this._app3d.scene.root.children.forEach(entity => {
      if (entity.name === '0513_dragon_animation_v2' || entity.name === '0513_eagle_animation_right') {
        entity.enabled = false;
        // entity.animation.loop = false;
        this._entitys.push(entity);
      }
    });

    this.setData({ running: true });
  },
  onunload() {
    this._pc = null;
    this._app3d = null;
    this._camera3d = null;
    this._canvas3d = null;
    this._gl = null;

    this.clsclient = null;
    this.vkCtx = null;

    this._entitys = null;
  }
});