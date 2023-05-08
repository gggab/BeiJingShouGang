const util = require('./utils/util.js')
// app.js
import {
  license
} from "./config";
App({
  async onLaunch() {
    // const enginePlugin = requirePlugin("SPAREngine");
    // const ARPlugin = requirePlugin('SPARPlugin');
    // ARPlugin.inject(enginePlugin);

    // await ARPlugin.setLicense(license);
    // console.log('-----初始化插件完成-----');
    console.log(util.formatTime(new Date(Date.now())));
  }
})
