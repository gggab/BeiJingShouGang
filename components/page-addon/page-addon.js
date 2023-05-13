// components/page-addon/page-addon.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showLoading: { type: Boolean, value: true },
    progress: { type: Number, value: 3 },
    showScan: { type: Boolean, value: false },
    showFinal: { type: Boolean, value: false },
    firstLocalized: { type: Boolean, value: false }
  },

  /**
   * 组件的初始数据
   */
  data: {
    xlz: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindBack() {
      wx.navigateBack()
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
                title: '下载成功，请在相册内查看',
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
  },
  lifetimes: {
    attached: function () {
      let index = 0;
      this.lpIntervalId = setInterval(() => {
        index++
        index = index % 31;
        this.setData({ xlz: index })
      }, 34);
      console.log()
    }
  },
  observers: {
    "showLoading": function (enable) {
      if (!enable) {
        if (this.lpIntervalId) {
          clearInterval(this.lpIntervalId);
        }
      }
    }
  }
})
