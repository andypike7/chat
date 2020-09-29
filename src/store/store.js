import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    userName: null,
  },
  getters: {
    USERNAME: state => {
      return state.userName;
    }
  },
  mutations: {
    SET_USERNAME: (state, value) => {
      state.userName = value;
      localStorage.setItem('userName', value);
    },
    CLEAR_USERNAME: (state) => {
      state.userName = null;
      localStorage.removeItem('userName');
    },
  },
});