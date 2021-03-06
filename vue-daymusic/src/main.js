import 'babel-polyfill'
import Vue from 'vue'
import App from './App'

import router from './router'
import store from './store'
import VueLazyload from 'vue-lazyload'

import 'common/stylus/index.styl'

// 解决移动端点击300ms问题
import fastclick from 'fastclick'

fastclick.attach(document.body)
/**
 * //提示生产环境
 */
Vue.config.productionTip = false

Vue.use(VueLazyload,{
  loading : require('base/loading/loading.gif')
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
