<template>
  <v-app>
    <TheHeader />
    <TheChat/>
  </v-app>
</template>

<script>
import TheChat from './components/TheChat';
import TheHeader from './components/TheHeader';

export default {
  name: 'App',

  components: {
    TheChat,
    TheHeader,
  },

  mounted() {
    const userName = localStorage.getItem('userName');

    if (userName !== null) {
      this.$store.commit('SET_USERNAME', userName)
    }
  },
};
</script>
