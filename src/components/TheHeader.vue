<template>
  <v-app-bar
    app
    color="primary"
    dark
  >
    <div class="d-flex align-center">
      <h2>Tada Chat</h2>
    </div>

    <v-spacer></v-spacer>

    <span v-if="userName !== null">
      Hello, <b>{{ userName }}</b>!
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon
            v-on="on"
            size="small"
            @click="becomeAnonimous"
          >
            mdi-close
          </v-icon>
        </template>
        <span>Become anonimous</span>
      </v-tooltip>
    </span>
    <span v-else>
      You are <b>anonymous</b>
    </span>
  </v-app-bar>
</template>

<script>
export default {
  computed: {
    userName() {
      return this.$store.getters.USERNAME;
    },
  },
  methods: {
    becomeAnonimous() {
      this.$store.commit('CLEAR_USERNAME');
    },
  }
}
</script>
