import { Recognizer } from "clsclient";
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
// pages/cls-three/cls-three.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.captureCanvas = createOffscreenCanvas({ type: '2d', width: 0, height: 0 });
    // NEED
    // this.vkFrame
    // this.session

    // 创建 clsClinet
    this.clsClient = new Recognizer({ ...prop.clsConfig, autoFilterEma: false });
    this.clsClient.getCameraWithParam = async () => {
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
        const width = 480//this.session.cameraSize.width * this.capturePixelRatio;
        const height = 640//this.session.cameraSize.height * this.capturePixelRatio;
        pixels = frame.getCameraBuffer(width, height);
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
          resolve(this.cameraImageWithPose);
        });
      });
    }
    this.clsClient.start({ 
      minInterval: clsConfig.interval, 
      onFound: this.onClsResult, 
      onLost: this.onClsLost,
      onError: this.onClsError 
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