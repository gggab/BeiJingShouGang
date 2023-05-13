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
const MaxVideoRecoderFrame = 30;
// const app = getApp()
// console.log(app)
// pages/cls-three/cls-three.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    width: 1,
    height: 1,
    fps: 0,
    isRecorder: false,
    frame: MaxVideoRecoderFrame,
    showLoading: true,
    progress: 3,
    // height: app.globalData.height ,
    recorded: false,
    showScan: true,
    isReadied: false, // 等待模型准备好
    firstLocalized: false,
    showFinal: false
  },
  startRecoder() {
    this.setData({
      isRecorder: true
    })
  },
  bindBack() {
    wx.navigateBack()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
    let index = 0;
    setInterval(() => {
      index++
      index = index % 31;
      this.setData({ xlz: index })
    }, 34);
  },

  onReady() {
    wx.createSelectorQuery()
      .select('#webgl')
      .node()
      .exec(async res => {
        this.canvas = res[0].node
        if (wx.getSystemInfoSync().platform == "devtools") {
          this.threeScene = new threeScene(this.canvas);
        } else {
          await this.initVK();
        }
        this.initCLS();

        if (this.threeScene) {
          let assetsLoaderPromises = [];
          let assets = [
            // 'https://ball.forgenius.cn/models/eagle.glb',
            'https://ball.forgenius.cn/models/eagle_left.glb',
            // 'https://ball.forgenius.cn/models/eagle_right.glb',
            // 'https://ball.forgenius.cn/models/tianma.glb',
            // 'https://dldir1.qq.com/weixin/miniprogram/RobotExpressive_aa2603d917384b68bb4a086f32dabe83.glb',
            // 'https://ball.forgenius.cn/models/draco_left.glb',
            'https://ball.forgenius.cn/models/draco_right.glb',
            // 'https://ball.forgenius.cn/models/0512_dragon_v2.glb',
            // 'https://ball.forgenius.cn/models/long.glb',
            // 'https://ball.forgenius.cn/models/bear.glb',
            // 'https://ball.forgenius.cn/models/bear_left.glb',
            // 'https://ball.forgenius.cn/models/hailiang.glb',
            // 'https://ball.forgenius.cn/models/wolf.glb',
          ]
          assets.forEach((url) => {
            assetsLoaderPromises.push(this.threeScene.loadModel(url));
          });
          // 加载太快了，看不到进度，这里等5秒方便测试
          // assetsLoaderPromises.push(new Promise((resolve,reject)=>{
          //   setTimeout(() => {
          //     resolve();
          //   }, 5000);
          // }))
          console.log("start load assets");
          // 进度是假的
          let intervalId = setInterval(() => {
            // console.log(this.data.progress)
            if (this.data.progress < 94) {
              this.setData({ progress: this.data.progress + 5 });
            }
          }, 200);
          await Promise.all(assetsLoaderPromises);
          // 加载完成后，清除进度更新
          clearInterval(intervalId);
          this.setData({ progress: 100, isReadied: true });
          this.threeScene.isReadied = true; // 通知模型都加载好了
          // 延迟1ms，隐藏进度条
          setTimeout(() => {
            this.setData({ showLoading: false });
          }, 1);
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
    const that = this;
    return new Promise(async (resolve, reject) => {
      session.start(async err => {
        if (err) return console.error('VK error', err);
        const canvas = that.canvas;

        const onFrame = async timestamp => {
          if (!that.timestamp) {
            that.timestamp = timestamp;
            that.datiletime = 0;
          }
          that.detailTime = (timestamp - that.timestamp) / 1000;
          that.datiletime += that.detailTime;
          that.timestamp = timestamp;
          // console.log(that.datiletime);
          const frame = that.vkFrame = session.getVKFrame(canvas.width, canvas.height);
          if (frame) {
            if (that.threeScene) {
              const clsWorldMatrix = that.clsClient?.getPoseInMap(frame.camera.viewMatrix);
              if(clsWorldMatrix){
                that.playAudio();
              }
              that.threeScene.render(frame, clsWorldMatrix);
            }
            that.analysis();
          }

          if (that.data.isRecorder && that.datiletime > 0.0416) {
            if (!that.recorder) {
              that.recorder = wx.createMediaRecorder(canvas, {
                duration: 30 * 1000,
                videoBitsPerSecond: 1000,
                fps: 24
              })
              await new Promise(resolve => {
                that.recorder.on('start', resolve);
                that.recorder.start();
              });
            }
            await new Promise(resolve => that.recorder.requestFrame(resolve));
            let _frame = that.data.frame - 0.0416;
            that.setData({
              frame: _frame
            })

            if (that.data.frame <= 0 || !that.data.isRecorder) {
              const { tempFilePath } = await new Promise(resolve => {
                that.recorder.on('stop', resolve)
                that.recorder.stop()
              })
              this.videotempFilePath = tempFilePath;
              console.log(tempFilePath);
              
              // 这里不写入相册，需要用户手动点击
              // wx.saveVideoToPhotosAlbum({
              //   filePath: tempFilePath,
              //   success(res) {
              //     console.log('保存成功');
              //   },
              //   fail(res) {
              //     console.log('保存失败', res);
              //   }
              // });

              that.recorder.destroy();
              that.recorder = null;
              that.setData({
                frame: MaxVideoRecoderFrame,
                isRecorder: false,
                recorded: true,
              })
            }
          }
          if (that.datiletime > 0.0416) {
            that.datiletime -= 0.0416;
          }
          session.requestAnimationFrame(onFrame)
        }
        session.requestAnimationFrame(onFrame)
        that.threeScene = new threeScene(canvas);
        resolve();
      })
    })
  },
  playAudio() {
    if (this.isAudioPlaying) return;
    this.isAudioPlaying = true;
    // （仅在 iOS 生效）是否遵循静音开关
    wx.setInnerAudioOption({
      obeyMuteSwitch: false
    });
    const innerAudioContext = wx.createInnerAudioContext({
      useWebAudioImplement: false // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
    })
    innerAudioContext.src = 'https://ball.forgenius.cn/2079_forest-ambience.mp3'
    innerAudioContext.play() // 播放

    const innerAudioContext2 = wx.createInnerAudioContext({
      useWebAudioImplement: false // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
    })
    innerAudioContext2.src = 'https://ball.forgenius.cn/1822_crowd-chatter.mp3'
    innerAudioContext2.play() // 播放

    this.audios = [innerAudioContext, innerAudioContext2];
  },
  async stopRecoder() {
    if (this.videotempFilePath) return;
    const that = this;
    const { tempFilePath } = await new Promise(resolve => {
      that.recorder.on('stop', resolve)
      that.recorder.stop()
    })
    this.videotempFilePath = tempFilePath;
    console.log(tempFilePath);
    that.recorder.destroy();
    that.recorder = null;
    that.setData({
      frame: MaxVideoRecoderFrame,
      isRecorder: false,
      recorded: true,
    });
  },
  saveVideoToPhotosAlbum() {
    wx.saveVideoToPhotosAlbum({
      filePath: this.videotempFilePath,
      success: (res) => {
        console.log('保存成功');
        this.videotempFilePath = '';
        this.setData({
          recorded: false,
          showFinal: true
        });
      },
      fail: (res) => {
        console.log('保存失败', res);
      }
    });
  },
  closeSaveVideo() {
    this.setData({
      recorded: false,
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  initCLS() {
    // 穿件离屏截图 canvas
    this.captureCanvas = wx.createOffscreenCanvas({ type: '2d', width: 0, height: 0 });

    this.capturePixelRatio = 480 / this.session?.cameraSize.width

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
        if (!this.session) {
          reject(null);
          return;
        }
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
    if (this.audios) {
      this.audios.forEach(audio => {
        audio.stop()
      })
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
  /**
   * 下载视频并保存到相册
   */
  downloadVideoHandler() {
    let link = "https://ball.forgenius.cn/video.mp4";//e.currentTarget.dataset.link;
    let fileName = new Date().valueOf();
    wx.downloadFile({
      url: link,
      filePath: wx.env.USER_DATA_PATH + '/' + fileName + '.mp4',
      success: res => {
        console.log(res);
        let filePath = res.filePath;
        wx.saveVideoToPhotosAlbum({
          filePath,
          success: file => {
            wx.showToast({
              title: '下载成功',
              icon: 'success',
              duration: 2000
            })
            let fileMgr = wx.getFileSystemManager();
            fileMgr.unlink({
              filePath: wx.env.USER_DATA_PATH + '/' + fileName + '.mp4',
              success: function (r) {

              },
            })
          },
          fail: err => {
            console.log(err)
            if (err.errMsg === 'saveVideoToPhotosAlbum:fail auth deny') {
              wx.showModal({
                title: '提示',
                content: '需要您授权保存相册',
                showCancel: false,
                success: data => {
                  wx.openSetting({
                    success(settingdata) {
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        wx.showModal({
                          title: '提示',
                          content: '获取权限成功,再次点击下载即可保存',
                          showCancel: false,
                        })
                      } else {
                        wx.showModal({
                          title: '提示',
                          content: '获取权限失败，将无法保存到相册哦~',
                          showCancel: false,
                        })
                      }
                    },
                  })
                }
              })
            }
          }
        })
      }
    })
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
    if (!this.data.firstLocalized) {
      this.setData({firstLocalized: true});
      setTimeout(() => {
        this.setData({ showScan: false });
      }, 1000);
    }
  },
  /**
   * cls 识别失败
   */
  onClsLost(clsRes) {
    console.log('cls lose', clsRes);
  },
  onClsError(err) {
    console.log('cls error', err);
  }
})