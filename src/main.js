import Vue from 'vue'
// import Vuex from 'vuex';
import { store } from './store/store';
import App from './App.vue'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false

export const bus = new Vue();

new Vue({
  vuetify,
  store,
  render: h => h(App),
}).$mount('#app');
