<template>
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

        <div v-else-if="rooms.length === 0">
          Active rooms: {{ rooms.length }}.
          CurrentRoom: {{ currentRoom }}
          <v-select
            label="CurrentRoom"
            outlined
            append-icon="mdi-plus"
            clear-icon="mdi-minus"
            :items="rooms"
            :value="0"
            @change="changeRoom"
            @click:append="addRoom"
          />
        </div>

        <div v-else>
          <div class="mb-5">
            No active rooms now.
            You may create a new one.
          </div>
          <v-text-field
            label="New room name"
            outlined
            dense
            clearable
            prepend-icon="mdi-home-outline"
            append-icon="mdi-cancel"
            :counter="settings.max_room_title_length"
            @click:append="cancelNewRoomCreation"
          />
          <v-textarea
            label="Your message"
            outlined
            clearable
            rows="1"
            auto-grow
            :counter="settings.max_message_length"
            prepend-icon="mdi-message-text-outline"
          />
          <div class="text-center my-0">
            <v-btn
              color="success"
              v-text="'Create a room'"
              @click="isSheetVisible = !isSheetVisible"
            />
            <v-btn
              color="accent"
              v-text="'Cancel'"
              class="mx-4"
              @click="isSheetVisible = !isSheetVisible"
            />
          </div>
        </div>

        <hr />
        <hr />
        <hr />

        <!-- <h1-- class="display-2 font-weight-bold mb-3">
          Welcome to Tada-Chat
        </h1-->
        Settings:
        {{ settings }}
        <hr />
        Rooms:
        {{ rooms }}
        <hr />
        Messages:
        {{ messages }}
        <hr />

        <!-- Комнаты:
        <v-textarea
          label="Введите сообщение"
          auto-grow
          autofocus
          clearable
          background-color="#ddf"
        />

        <v-btn
          :disabled="sendDisabled"
          :loading="sendDisabled"
          @click="sendMessage"
        >
          Send a Message
        </v-btn>
        -->

      </v-col>

    </v-row>
  </v-container>
</template>

<script>
  import axios from 'axios';

  const apiUrl = 'https://nane.tada.team/api';

  const HAVE_NOTHING = 0;
  const HAVE_SETTINGS = 1;
  const HAVE_ROOMS = 2;

  const EMULATE_SLOW_CONNECTION = true;

  export default {
    name: 'HelloWorld',
    data: () => ({
      // main data: settings and rooms
      loadingMainDataState: null,
      isLoadingMainData: false,
      isAnErrorWhileLoadingMainData: false,
      settings: {},
      rooms: [],

      messages: [],
      currentRoom: null,
      isSheetVisible: false,
      sheetText: null,
      selectedRoom: null,
      sendDisabled: false,
      state: HAVE_NOTHING,
    }),

    async mounted() {
      console.clear();

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

      // this.loadingDataSubject = 'Rooms';

      // if (this.rooms.length === 0) {
      //   // alert('we have no rooms!');
      // }
      // else {
      //   console.log('*** GET:', this.rooms[0].name);
      //   this.refreshRoom(this.rooms[0].name);
      //   // alert(`we have ${this.rooms.length} room(s)!`);
      // }
      // this.getMessages();
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
    },
    methods: {
      initializeRooms() {
        this.loadingMainDataState = null;
        console.log('*** initializeRooms');
      },
      sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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

            console.log('*** SETTINGS:', that.settings);
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
            console.log('*** ROOMS:', response.data.result)
            that.rooms = response.data.result;
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
      async refreshRoom(roomName) {
        this.currentRoom = roomName;
      },

      cancelNewRoomCreation() {
        alert('cancelNewRoomCreation');
      },
      addRoom() {
        alert('addRoom');
      },
      sendMessage() {
        this.sendDisabled = true;
        setTimeout(() => {
          this.sendDisabled = false;
        }, 1000);
      },
      changeRoom() {
        alert('changeRoom');
      },
      getMessages() {
        /*
        axios
          .get(`${apiUrl}/rooms/${this.currentRoom}/history`)
          .then(response => console.log('*** RESP:', response))
          .error(err => console.log('*** ERROR:', err));
        /*
        this.messages = {
          "result":[
            {
              "name":"kozma",
              "last_message":{
                "room":"kozma",
                "created":"2020-09-20T08:24:31.724098867Z",
                "sender":{
                  "username":"Козьма Прутков"
                },
                "text":"Сребролюбцы! сколь ничтожны ваши стяжания, коли все ваши сокровища не стоят одного листка из лаврового венка поэта!"
              },
            },
          ],
        };
        */
      },
    },
  }
</script>
