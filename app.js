// app.js
import {
  license
} from "./config";
App({
  async onLaunch() {
    const enginePlugin = requirePlugin("SPAREngine");
    const ARPlugin = requirePlugin('SPARPlugin');
    ARPlugin.inject(enginePlugin);

    await ARPlugin.setLicense(license);
    console.log('-----初始化插件完成-----');
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
