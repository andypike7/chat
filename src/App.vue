<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <h2>Tada Chat</h2>
      </div>

      <v-spacer></v-spacer>

      <!-- <span class="mr-2">1 active room(s)</span> -->

      <span v-if="getUserName !== null">
        Hello, <b>{{ getUserName }}</b>!
      </span>
      <span v-else>
        You are <b>anonymous</b>
      </span>

      <!-- <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      >
        <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn> -->
    </v-app-bar>

    <v-main>
      <HelloWorld/>
    </v-main>
  </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld';
import user from '@/utils/user';

export default {
  name: 'App',

  components: {
    HelloWorld,
  },

  data: () => ({
    //
  }),

  computed: {
    getUserName() {
      return user.getName();
    },
  },
};
</script>
