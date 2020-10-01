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
          <div v-if="displaySendForm">
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
              v-if="displayUserName"
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
              v-if="sendAllowed"
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
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
  import axios from 'axios';
  import { bus } from '@/main';

  const apiUrl = 'https://nane.tada.team/api';
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
      sendAllowed: false,
      isSheetVisible: false,
      sheetText: null,
      // common
      displaySendForm: false,
      sendDisabled: false,
      // user
      userName: null,
      displayUserName: true,
      userErrorMessage: null,
    }),
    created() {
      bus.$on('clearUserName', () => { // forced clearance from TheHeader
        this.userName = null;
        this.displayUserName = true;
      });
    },
    async mounted() {
      while (!await this.getSettings()) ;
      while (!await this.getRooms()) ;
      while (!await this.initializeRooms());
      this.stopLoading();

      this.userName = this.$store.getters.USERNAME;
      this.displayUserName = this.userName === null;
      console.log('*** this.userName:', this.userName, typeof this.userName);
      this.sendAllowed = true;
      this.displaySendForm = true;

      setTimeout(async () => {
        console.log('*** SCROLL START');
        await window.scrollTo({
          top: 10000,
          behavior: 'smooth'
        });
        console.log('*** SCROLL END');

      }, 500);
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
      async initializeRooms() {
        if (this.rooms.length === 0) {
          console.log('*** We have no rooms!');
          return true;
        }
        else {
          this.rooms = this.rooms.map((item) => item.name);
          return await this.refreshRoom(this.rooms[this.rooms.length - 2]);
        }
      },
      /* *** */
      async refreshRoom(roomName) {
        this.currentRoom = roomName;
        console.log('*** refreshRoom:', this.currentRoom);
        return await this.getMessages();
      },
      async getSettings() {
        const that = this;
        let loaded = false;
        this.startLoading('Loading settings...');

        if (EMULATE_SLOW_CONNECTION) {
          await this.sleep(1000);
        }

        await axios.get(`${apiUrl}/settings`)
          .then(response => {
            that.settings = response.data.result;
            loaded = true;
          })
          .catch(() => this.displayError('Cannot load the chat settings.'));

        this.stopLoading();
        return loaded;
      },
      retryLoading() {
        this.isSheetVisible = false;
        this.getSettings();
      },
      async getRooms() {
        const that = this;
        let loaded = false;
        this.startLoading('Loading rooms...');

        if (EMULATE_SLOW_CONNECTION) {
          await this.sleep(1000);
        }

        await axios.get(`${apiUrl}/rooms`)
          .then(response => {
            that.rooms = response.data.result;
            this.loadingMainDataState = null;
            loaded = true;
          })
          .catch(() => this.displayError('Cannot get the rooms.'));

        this.stopLoading();
        return loaded;
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
        this.$store.commit('SET_USERNAME', userName);

        this.sendDisabled = true;
        setTimeout(() => {
          this.sendDisabled = false;
        }, 1000);
      },
      async getMessages() {
        let loaded = false;
        this.startLoading('Loading messages...');

        if (EMULATE_SLOW_CONNECTION) {
          await this.sleep(1000);
        }

        await axios
          .get(`${apiUrl}/rooms/${this.currentRoom}/history`)
          .then(response => {
            console.log('*** RESP:', response);
            this.messages = response.data.result;
            loaded = true;
          })
          .catch(() => this.displayError('Cannot load messages.'));

        this.stopLoading();
        return loaded;
      },
      // main loading
      startLoading(msg) {
        this.isSheetVisible = false;
        this.loadingMainDataState = msg;
        this.isLoadingMainData = true;
        this.isAnErrorWhileLoadingMainData = false;
      },
      stopLoading() {
        this.loadingMainDataState = null;
      },
      displayError(msg) {
        this.sheetText = msg;
        this.isSheetVisible = true;
        this.loadingMainDataState = msg;
        this.isLoadingMainData = false;
        this.isAnErrorWhileLoadingMainData = true;
      },
      sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      },
    },
  }
</script>
