<template>
  <v-main>
    <v-container>
      <v-row class="text-center">
        <v-bottom-sheet
          v-model="isSheetVisible"
          persistent
        >
          <v-sheet class="text-center">
            <div style="height:20px" />
            <div>{{ sheetText }}</div>
            <div class="my-2 mb-0">
              <v-btn
                small
                color="error"
                class="my-2 mb-6"
                @click="retryLoading"
              >
                Retry
              </v-btn>
            </div>
          </v-sheet>
        </v-bottom-sheet>
        <v-col class="mb-4">
          <div v-if="loadingMainDataState !== null">
            <v-text-field
              :disabled="isLoadingMainData"
              :label="loadingMainDataLabel"
              :prepend-icon="loadingMainDataIcon"
              :value="loadingMainDataState"
              color="info"
              outlined
            >
            </v-text-field>
          </div>
          <div v-else-if="rooms.length !== 0">
            <div class="mb-5">
              <span v-if="rooms.length">
                Active rooms: <b>{{ rooms.length }}</b>.
                CurrentRoom: <b>{{ currentRoom }}</b>.
              </span>
              <span v-else>
                No active rooms now. You may create a new one.
              </span>
            </div>
            <v-select
              v-if="!isNewRoomCreation"
              label="Room"
              outlined
              prepend-icon="mdi-home-outline"
              clear-icon="mdi-minus"
              :items="rooms"
              :value="currentRoom"
              @change="refreshRoom"
            >
              <template v-slot:append-outer>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon
                      v-on="on"
                      @click="addRoom"
                    >
                      mdi-plus-circle-outline
                    </v-icon>
                  </template>
                  <span>Create a new room</span>
                </v-tooltip>
              </template>
            </v-select>
          </div>
          <div
            v-if="messages.length && !isNewRoomCreation"
          >
            <div
              v-for="(message, key) in messages"
              :key="key"
            >
              <v-card class="text-left mb-6">
                <v-card-title>
                  {{ message.sender.username }}
                </v-card-title>
                <v-card-text style="padding-bottom:0">
                  {{ message.text }}
                </v-card-text>
                <v-card-subtitle class="my-0">
                  <div style="color:gray;font-size:12px">
                    {{
                      new Date(message.created)
                        .toLocaleString('ru', {
                          weekday: 'long',
                          day:   '2-digit',
                          month: 'short',
                          year:  'numeric',
                          hour:  '2-digit',
                          minute:  '2-digit',
                          second:  '2-digit',
                        })
                    }}
                  </div>
                </v-card-subtitle>
              </v-card>
            </div>
          </div>
          <div v-if="isNewRoomCreation">
            <v-text-field
              label="New room name"
              outlined
              dense
              clearable
              prepend-icon="mdi-home-outline"
              :counter="settings.max_room_title_length"
              @click:append="cancelNewRoomCreation"
            />
          </div>
          <v-text-field
            v-if="userIsAnonimous"
            label="Your name"
            v-model="userName"
            outlined
            dense
            clearable
            prepend-icon="mdi-account-outline"
            :error-messages="userErrorMessage"
            :counter="settings.max_username_length"
            @click:append="cancelNewRoomCreation"
          />
          <v-textarea
            label="Your message"
            outlined
            clearable
            rows="1"
            dense
            auto-grow
            prepend-icon="mdi-message-text-outline"
            :counter="settings.max_message_length"
          />
          <div
            v-if="isNewRoomCreation"
            class="text-center my-0"
          >
            <v-btn
              color="success"
              @click="clickRoomCreation"
              v-text="'Create a room'"
            />
            <v-btn
              color="accent"
              class="mx-4"
              @click="cancelRoomCreation"
              v-text="'Cancel'"
            />
          </div>
          <div
            v-if="isSendAllowed"
            class="text-center my-0"
          >
            <v-btn
              color="accent"
              class="mx-4"
              :disabled="sendDisabled"
              @click="sendMessage"
              v-text="'Send'"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
  import axios from 'axios';
  // import user from '@/utils/user';

  const apiUrl = 'https://nane.tada.team/api';

  const HAVE_NOTHING = 0;
  const HAVE_SETTINGS = 1;
  const HAVE_ROOMS = 2;

  const EMULATE_SLOW_CONNECTION = true;

  export default {
    name: 'TheChat',
    data: () => ({
      // settings
      loadingMainDataState: null,
      isLoadingMainData: false,
      isAnErrorWhileLoadingMainData: false,
      settings: {},
      // rooms
      rooms: [],
      currentRoom: null,
      isNewRoomCreation: false,
      // messages
      messages: [],
      isSendAllowed: false,
      isSheetVisible: false,
      sheetText: null,
      // common
      state: HAVE_NOTHING,
      sendDisabled: false,
      // user
      userName: null,
      userErrorMessage: null,
    }),

    async mounted() {
      // console.clear();

      // this.userName = user.getName();


      // don't go futher if we can't get the settings
      while (!await this.getSettings()) ;
      // state: HAVE_SETTINGS
      // this.settings = {
      //   "max_message_length": 10500,
      //   "max_room_title_length": 50,
      //   "max_username_length": 50,
      //   "uptime": 1224778297317
      // }

      // don't go futher if we can't get the rooms
      while (!await this.getRooms()) ;
      // state: HAVE_ROOMS
      // this.result = [
      //   {
      //     "name": "kozma",
      //     "last_message": {
      //       "room": "kozma",
      //       "created": "2020-09-26T08:50:29.361895954Z",
      //       "sender": {
      //         "username": "Козьма Прутков",
      //       },
      //       "text": "Не робей перед врагом: лютейший враг человека - он сам."
      //     }
      //   },
      //   {
      //     "name": "test",
      //     "last_message": {
      //       "room": "test",
      //       "created": "2020-09-26T08:49:13.379184978Z",
      //       "sender": {
      //         "username": "Аноним"
      //       },
      //       "text": "6"
      //     }
      //   }
      // ]

      this.initializeRooms();

      this.isSendAllowed = true;
    },
    computed: {
      loadingMainDataIcon() {
        return this.isAnErrorWhileLoadingMainData
          ? 'mdi-emoticon-sad'
          : 'mdi-loading mdi-spin';
      },
      loadingMainDataLabel() {
        return this.isAnErrorWhileLoadingMainData
          ? 'An error occured'
          : 'Progress';
      },
      userIsAnonimous() {
        return true; //user.getName() === null || user.getName() === undefined;
      },

      fieldIsRequired(value) {
        console.log('*** V:', value, typeof value);
        return true; //value !== null && value.trim().length > 0 || 'This field is required.';
      },
      checkUserNameLength(value) {
        console.log('* VALUE:', value);
        console.log('* S:', this.settings);
        return 'S:' + this.settings.max_username_length + ' /// ' + value /*value.length <= this.settings.max_username_length || 'Too long.'*/;
      },
    },
    methods: {
      addRoom() {
        this.isNewRoomCreation = true;
      },
      clickRoomCreation() {
      },
      cancelRoomCreation() {
        this.isNewRoomCreation = false;
      },
      initializeRooms() {
        if (this.rooms.length === 0) {
          console.log('*** We have no rooms!');
        }
        else {
          this.rooms = this.rooms.map((item) => item.name);
          this.refreshRoom(this.rooms[this.rooms.length - 1]);
        }
      },
      /* *** */
      refreshRoom(roomName) {
        this.currentRoom = roomName;
        console.log('*** currentRoom:', this.currentRoom);
        this.getMessages();
      },
      async getSettings() {
        this.state = HAVE_NOTHING;
        this.isSheetVisible = false;

        this.loadingMainDataState = 'Loading settings...';
        this.isLoadingMainData = true;
        this.isAnErrorWhileLoadingMainData = false;

        if (EMULATE_SLOW_CONNECTION) {
          await this.sleep(1000);
        }

        const that = this;

        await axios.get(`${apiUrl}/settings`)
          .then(response => {
            that.settings = response.data.result;
            this.state = HAVE_SETTINGS;
          })
          .catch(() => {
            this.sheetText = 'Cannot load the chat settings.';
            this.isSheetVisible = true;

            this.loadingMainDataState = 'Cannot load the chat settings.';
            this.isLoadingMainData = false;
            this.isAnErrorWhileLoadingMainData = true;
        });

        return this.state === HAVE_SETTINGS;
      },
      retryLoading() {
        this.isSheetVisible = false;
        this.getSettings();
      },
      async getRooms() {
        this.isSheetVisible = false;
        this.loadingMainDataState = 'Loading rooms...';
        this.isLoadingMainData = true;
        this.isAnErrorWhileLoadingMainData = false;

        if (EMULATE_SLOW_CONNECTION) {
          await this.sleep(1000);
        }

        const that = this;

        await axios.get(`${apiUrl}/rooms`)
          .then(response => {
            that.rooms = response.data.result;
            this.loadingMainDataState = null;
            this.state = HAVE_ROOMS;
          })
          .catch(() => {
            this.sheetText = 'Cannot get the rooms.';
            this.isSheetVisible = true;
            this.loadingMainDataState = 'Cannot load the rooms.';
            this.isLoadingMainData = false;
            this.isAnErrorWhileLoadingMainData = true;
          });

        return this.state === HAVE_ROOMS;
      },

      cancelNewRoomCreation() {
        alert('cancelNewRoomCreation');
      },
      sendMessage() {
        // userName validation
        let userName = this.userName;
        if (userName === null || userName.length === 0) {
          this.userErrorMessage = 'User name must me filled.';
          return;
        }
        const max = this.settings.max_username_length;
        if (userName.length > max) {
          this.userErrorMessage = `User name must not exeed ${max} symbols.`;
          return;
        }
        this.userErrorMessage = null;
        this.$store.commit('SET_USERNAME', userName)

/*
        if (user.getName() !== name) {
          user.setName(name);
        }
/*
        this.userNameMessage = 'Invalid username.';
        /*
        this.userNameMessage = 'Invalid username.';
        /*
        let name = this.userName === null ? '' : this.userName.trim();
        console.log('N:', name, typeof name, name.length);

        if (name.length === 0 || name.length > this.settings.max_username_length) {
          this.userNameMessage = 'Invalid username.';
          return;
        }
        this.userNameMessage = null;

        if (this.userName)
        console.log('*** userName:', this.userName);
        */
        this.sendDisabled = true;
        setTimeout(() => {
          this.sendDisabled = false;
        }, 1000);
      },
      async getMessages() {
        if (EMULATE_SLOW_CONNECTION) {
          await this.sleep(1000);
        }

        axios
          .get(`${apiUrl}/rooms/${this.currentRoom}/history`)
          .then(response => {
            console.log('*** RESP:', response);
            this.messages = response.data.result;
          })
          .catch(err => console.log('*** ERROR:', err));
      },
      sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      },
    },
  }
</script>
