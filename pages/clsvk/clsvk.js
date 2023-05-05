const sysInfo = wx.getSystemInfoSync();

Page({
  data: {
    wxapi: wx,
    canvasW: sysInfo.windowWidth,
    canvasH: sysInfo.windowHeight,
    canvasT: 0,
    canvasL: 0,

    // 新园区
    clsConfig: {
      apiKey: "da795ff1828d676dab9aaf9c018fe6eb",
      apiSecret: "4e34c727701c60ba10435d628c485137564e932b6dd50983389894b9d8ffdade",
      clsAppId: "98e15642624043b7992e70c862818b24",
      arannotationId: "8233a115b0857f2d46d1bb18aaf60b75"
    },

    cameraWidth: `${sysInfo.windowWidth}px`,
    cameraHeight: `${sysInfo.windowHeight * 0.8}px`,

    running: true,
    minInterval: 1000, // 识别间隔
    motion: true,


    showScan: true,

    load3d: false,

    projectUrl: 'https://sightp-tour-cdn.sightp.com/wxapp/apps/Test/pdrjy_office_v1',
    sceneFileName: '1434681.json',
    enhanceDevtools: sysInfo.platform === 'devtools',
    fackDataConfig: {
      host: "https://wenlvlocsim.easyar.com",
      filename: "yuanqu2022_05_30_181348_meif",//'1647249026091',"xy8h_04_14_15_32",//"xy8h_04_23_11_18_30",'xy8h_04_09_14_22_37',
      startIndex: 0,
      autoUpdate: true,
      useRemoteSet: false
    },
    // loadScripts,
    loadNetworkScripts: {},
    btns: {
      takePhoto: true
    },
  },
  onLoad: function (options) {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
    this.setData({ load3d: true })
    setTimeout(() => {
      // demo动态更新clsConfig
      // this.updateClsConfig();
    }, 20 * 1000);
  },

  updateClsConfig() {
    this.setData({
      clsConfig: {
        apiKey: "da795ff1828d676dab9aaf9c018fe6eb", // EasyAR开发中心 - API KEY - API Key
        apiSecret: "4e34c727701c60ba10435d628c485137564e932b6dd50983389894b9d8ffdade", // EasyAR开发中心 - API KEY - API Secret
        clsAppId: "86b2f5c1ab8e48fa833fa4f65db7d411",
        arannotationId: "bd642ce06fcd9959f0b05963d78facd6"
      }
    });
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
    this.clsVKCameraContext = clsVKCameraContext;
    this.vkCtx = VKSessionContext;
    console.log("onClsClientLoad", clsClientContext, VKSessionContext);
    VKSessionContext.VKUpdate = this.onVKUpdate;
    VKSessionContext.stableDetector.registerStableChange((value) => {
      if (value) {
        console.log('clsVK is stable');
      } else {
        console.log('clsVK is not stable');
      }
    });
    this.annitations = VKSessionContext.self.clsdata.ema.annotations;
    console.log(this.annitations);
    if (this._app3d) {
      this._app3d.fire("setAnnotation", this.annitations);
    }
  },
  async takePhoto() {
    if (!this.clsVKCameraContext) return console.warn('!clsVKCameraContext');
    const { data: pixels, width, height } = await this.clsVKCameraContext.takePhoto();
    console.log(`buffer`, pixels);
    const canvas2d = wx.createOffscreenCanvas({ type: "2d", width, height });
    const ctx = canvas2d.getContext('2d')
    let ctxImageData = ctx.createImageData(width, height);
    ctxImageData.data.set(new Uint8ClampedArray(pixels));
    ctx.putImageData(ctxImageData, 0, 0);
    setTimeout(() => {
      let dataurl = canvas2d.toDataURL("image/jpeg", 1);
      let url = dataurl;
      wx.previewImage({
        current: '', // 当前显示图片的 http 链接
        urls: [url] // 需要预览的图片 http 链接列表
      })
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
        this._camera3d.worldTransform.set(data.clsCameraPose);
      } else {
        this._camera3d.worldTransform.set(data.vkCameraPose);
      }
      // this._app3d.tick();
    }
  },
  onClsClientResult(e) {
    console.log("onClsClientResult", e.detail);
    if (e.detail.statusCode == 0) {
        // 识别成功
    } else {
      console.log('当前设备朝向是否适合cls:', this.vkCtx.stableDetector.isSuitForCls);
    }
  },
  onClsClientError(e) {
    console.log("onClsClientError", e.detail);
    this.setData({
      error: e.detail,
    });
  },
  on3dLoadProgress: function (progress) {
    // console.log(progress); 
  },
  on3dError: function (e) {
    console.error(e);
  },
  on3dLoad: function (arg) {
    console.log('3d Loaded');

    this._pc = arg.detail.pc;
    this._app3d = arg.detail.app;
    this._app3d.graphicsDevice.maxPixelRatio = 2;
    this._camera3d = arg.detail.camera;
    this._canvas3d = arg.detail.canvas;
    this._gl = arg.detail.app.graphicsDevice.gl;

    this.vkCtx?.setApp3d(this._app3d);

    if (!this.annitations) {
      this._app3d.on("setAnnotation", (annitations) => {
        annitations.forEach(anno => {
          let cube = new this._pc.Entity();
          cube.addComponent("model", {
            type: "box"
          })
          let p = anno.transform.position;
          let r = anno.transform.rotation;
          let s = anno.transform.scale;
          cube.setLocalPosition(p.x, p.y, p.z);
          cube.setLocalRotation(r.x, r.y, r.z, r.w);
          cube.setLocalScale(s.x, s.y, s.z);
        })
      })
    }
    if (this.annitations) {
      this.annitations.forEach(anno => {
        let cube = new this._pc.Entity();
        cube.addComponent("model", {
          type: "box"
        })
        let p = anno.transform.position;
        let r = anno.transform.rotation;
        let s = anno.transform.scale;
        cube.setLocalPosition(p.x, p.y, p.z);
        cube.setLocalRotation(r.x, r.y, r.z, r.w);
        cube.setLocalScale(s.x, s.y, s.z);
      })
    }
    this.setData({ running: true });
  },
  preview() {
    wx.previewImage({ urls: ["https://mp.easyar.cn/artravel/puruan_scan_sample.jpg"] });
  },
  dismiss() {
    this.setData({ showScan: false });
  },
});