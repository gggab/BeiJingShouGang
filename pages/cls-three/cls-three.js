import { Recognizer } from "clsclient-wx";
import { threeScene } from "./threeScene";
const clsConfig = {
  apiKey: "c35172addcdff7780f4ca593b38520c7",
  apiSecret: "fb4c0a2f89cf64dc7cf2a63a7c5472029a05213e22688a3cc443a7dc39d227d9",
  clsAppId: "e51e02c9d50a45af9a3c1b39bb8852cc",
  arannotationId: "77c4a106e869c9a07dc941efb3bad19a",
  serverConifg: {
    "globalUrl": '/api/global',
    "arocUrl": '/api/clsv3',
    "clsUrl": '/api/cls-fe',
    "clsV3Url": '/api/clsv3',
    "uacUrl": '/api/uac-token',
    "cloudUrl": '/api/clsv3/v4/file/localize'
  },
  timeout: 5000,
  interval: 3000
}
const JPEG_QUALITY = 70;
// pages/cls-three/cls-three.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    width: 1,
    height: 1,
    fps: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  onReady() {
    wx.createSelectorQuery()
      .select('#webgl')
      .node()
      .exec(async res => {
        this.canvas = res[0].node
        await this.initVK();
        this.initCLS();

        if (this.threeScene) {
          this.threeScene.loadModel('https://dldir1.qq.com/weixin/miniprogram/space_27f8c621878e44d8b05916163ce83b40.glb');
        }
      })
  },
  async initVK() {
    const isSupportV2 = wx.isVKSupport('v2')
    if (!isSupportV2) return console.error('v2 is not support')

    const session = this.session = wx.createVKSession({
      track: {
        plane: { mode: 3 },
      },
      gl: this.canvas.getContext("webgl"),
      version: 'v2'
    })

    const info = wx.getSystemInfoSync();
    const pixelRatio = info.pixelRatio;
    const calcSize = (width, height) => {
      console.log(`canvas size: width = ${width} , height = ${height}`)

      this.canvas.width = width * pixelRatio / 2
      this.canvas.height = height * pixelRatio / 2
      console.log(`window width: ${width},window height: ${height}`);
      console.log(`canvas width: ${this.canvas.width}, canvas height: ${this.canvas.height}`);
      this.setData({
        width,
        height,
      })
    }
    calcSize(info.windowWidth, info.windowHeight);

    session.on('resize', () => {
      const info = wx.getSystemInfoSync()
      calcSize(info.windowWidth, info.windowHeight)
    })

    return new Promise((resolve, reject) => {
      session.start(err => {
        if (err) return console.error('VK error', err);
        const canvas = this.canvas;

        const onFrame = async timestamp => {
          const frame = this.vkFrame = session.getVKFrame(canvas.width, canvas.height);
          if (frame) {
            if (this.threeScene) {
              this.threeScene.render(frame,this.clsClient?.getPoseInMap(frame.camera.viewMatrix));
            }
            this.analysis();
          }
          session.requestAnimationFrame(onFrame)
        }
        session.requestAnimationFrame(onFrame)
        this.threeScene = new threeScene(canvas);
        resolve();
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  initCLS() {
    // 穿件离屏截图 canvas
    this.captureCanvas = wx.createOffscreenCanvas({ type: '2d', width: 0, height: 0 });

    this.capturePixelRatio = 480 / this.session.cameraSize.width

    // NEED
    // this.vkFrame
    // this.session

    // 创建 clsClinet
    this.clsClient = new Recognizer({ ...clsConfig, autoFilterEma: false }, null, true);

    // 注入获取图片和矩阵的方法
    this.clsClient.getCameraWithParam = () => {
      // timestamp: number,
      // cameraPos?: number[],
      // intrinsics?: number[],
      // base64?: string,
      // base64Img: string// 去除头部 base64.substr(23);
      return new Promise((resolve, reject) => {
        const frame = this.vkFrame;
        this.cameraImageWithPose = {};
        this.cameraImageWithPose.timestamp = new Date().getTime();
        this.cameraImageWithPose.cameraPos = [...frame.camera.viewMatrix];
        const intrinsics = frame.camera.intrinsics;
        if (intrinsics)
          this.cameraImageWithPose.intrinsics = [intrinsics[0] * this.capturePixelRatio, intrinsics[4] * this.capturePixelRatio, intrinsics[7] * this.capturePixelRatio, intrinsics[6] * this.capturePixelRatio];

        const canvas2d = this.captureCanvas;
        
        const width = this.session.cameraSize.width * this.capturePixelRatio;
        const height = this.session.cameraSize.height * this.capturePixelRatio;
        if (canvas2d.width != width || canvas2d.height != height) {
          canvas2d.width = width;
          canvas2d.height = height;
        }
        let pixels = frame.getCameraBuffer(width, height);
        if (!this.captureCTX) {
          this.captureCTX = canvas2d.getContext('2d');
        }
        let ctx = this.captureCTX;
        let ctxImageData = ctx.createImageData(width, height);
        ctxImageData.data.set(new Uint8ClampedArray(pixels));
        ctx.putImageData(ctxImageData, 0, 0);
        setTimeout(() => {
          let dataurl = canvas2d.toDataURL("image/jpeg", JPEG_QUALITY / 100);
          this.cameraImageWithPose.base64 = dataurl;
          this.cameraImageWithPose.base64Img = dataurl.substr(23);
          // for (let key in this.cameraImageWithPose) {
          //   if ( key == 'base64Img') {
          //     console.log(key, this.cameraImageWithPose[key].length);
          //     continue;
          //   }
          //   console.log(key, this.cameraImageWithPose[key]);
          // }
          resolve(this.cameraImageWithPose);
        });
      });
    }
    this.clsClient.getArannotations().then((res) => {
      // 开始识别，传入回调
      this.clsClient.start({
        minInterval: clsConfig.interval,
        onFound: this.onClsResult,
        onLost: this.onClsLost,
        onError: this.onClsError
      });
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if (this.threeScene) {
      this.threeScene.destroyScene();
    }
    if (this.clsClient) {
      this.clsClient.stop();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  analysis() {
    if (!this._lastTs) this._lastTs = Date.now()
    const ts = Date.now()

    if (!this._fc) this._fc = this._lastFc = 0
    this._fc++

    // 1s 统计一次
    if (ts - this._lastTs > 1000) {
      const fps = Math.round((this._fc - this._lastFc) * 1000 / (ts - this._lastTs))
      this._lastFc = this._fc

      this.setData({ fps })
      this._lastTs = ts
    }
  },
  /**
   * cls 识别成功
   */
  onClsResult(clsRes) {
    console.log('cls scc', clsRes);
  },
  /**
   * cls 识别失败
   */
  onClsLose(clsRes) {
    console.log('cls lose', clsRes);
  },
  onClsError(err) {
    console.log('cls error', err);
  }
})