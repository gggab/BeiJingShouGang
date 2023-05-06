const sysInfo = wx.getSystemInfoSync();
import { threeScene } from "./threeScene";
Page({
  data: {
    wxapi: wx,
    canvasW: sysInfo.windowWidth,
    canvasH: sysInfo.windowHeight,
    canvasT: 0,
    canvasL: 0,
    // 是否显示左上角的调试信息
    showDebugPanel: true,

    // 新园区
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

    running: false,
    minInterval: 1000, // 识别间隔
  },
  onLoad: function (options) {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
  },
  // 暂停定位
  pause() {
    this.setData({ running: false });
  },
  // 重启定位
  resume() {
    this.setData({ running: true });
  },

  onClsClientLoad(e) {
    let { clsClientContext, VKSessionContext, clsVKCameraContext } = e.detail;
    this.clsclient = e.detail.clsClientContext;
    this.clsVKCameraContext = clsVKCameraContext;
    this.vkCtx = VKSessionContext;
    console.log(VKSessionContext.self.cameraCanvas);
    console.log("onClsClientLoad", clsClientContext, VKSessionContext);
    console.log(VKSessionContext.self.cameraGL)
    VKSessionContext.VKUpdate = this.onVKUpdate.bind(this);
    VKSessionContext.stableDetector.registerStableChange((value) => {
      if (value) {
        console.log('clsVK is stable');
      } else {
        console.log('clsVK is not stable');
      }
    });
    this.annitations = VKSessionContext.self.clsdata.ema.annotations;
    // cls初始化完成，可以开始识别
    this.setData({running: true});
    // TODO：初始化 THREE
    this.threeScene = new threeScene(VKSessionContext.self.cameraCanvas);
    // this.initThree(VKSessionContext.self.cameraCanvas);
    // this.camera = threeCamera;
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
    // 每帧被调用，返回相机世界矩阵和投影矩阵
    let data = e;//.detail;
    this.threeScene.setProjectionMatrix(data.vkCamera.getProjectionMatrix(this.clsVKCameraContext.nearClip, this.clsVKCameraContext.farClip));
    // vkCameraPose 是大地图坐标系下的相机位姿，定位成功至少一次后，才会有值
    // 建议没有值的时候隐藏场景模型
    this.threeScene.setWorldMatrix(data.clsCameraPose || data.vkCameraPose);
    this.threeScene.updateScene();
  },
  onClsClientResult(e) {
    console.log("onClsClientResult", e.detail);
    if (e.detail.statusCode == 0) {
        // 识别成功
        console.log(e.detail);
        if (!this.firstScc) {
          this.firstScc = true;
        }
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
});