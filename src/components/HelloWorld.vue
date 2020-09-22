<template>
  <v-container>
    <v-row class="text-center">
      <v-bottom-sheet v-model="isSheetVisible">
        <v-sheet class="text-center">
          <div style="height:20px" />
          <div>{{ sheetText }}</div>
          <div class="my-2 mb-0">
            <v-btn
              small
              color="error"
              class="my-2 mb-6"
              @click="isSheetVisible = !isSheetVisible"
            >
              Retry
            </v-btn>
          </div>
        </v-sheet>
      </v-bottom-sheet>
      <v-col class="mb-4">
        <!-- <h1-- class="display-2 font-weight-bold mb-3">
          Welcome to Tada-Chat
        </h1-->
        Settings:
        {{ settings }}
        <hr>
        Rooms:
        {{ rooms }}
        <hr>
        Messages:
        {{ messages }}
        <hr>

        <!-- Комнаты:
        <v-select
          dark
          filled
          :items="rooms"
          value="Second"
          @change="changeRoom"
        /> -->
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

      </v-col>

    </v-row>
  </v-container>
</template>

<script>
  import axios from 'axios';

  const apiUrl = 'https://nane.tada.team/api';

  export default {
    name: 'HelloWorld',
    data: () => ({
      settings: {},
      rooms: [],
      messages: [],
      currentRoom: null,
      isSheetVisible: false,
      sheetText: null,
      selectedRoom: null,
      sendDisabled: false,
    }),

    beforeMounted() {
      console.clear();
    },

    async mounted() {
      await this.getSettings();
      await this.getRooms();

      if (this.rooms.length === 0) {
        alert('we have no rooms!');
      }
      else {
        console.log('*** GET:', this.rooms[0].name);
        this.refreshARoom(this.rooms[0].name);
        alert(`we have ${this.rooms.length} room(s)!`);
      }
      this.getMessages();
    },
    methods: {
      async getSettings() {
        const that = this;

        this.isSheetVisible = false;

        await axios.get(`${apiUrl}/settings`)
          .then(response => {
            that.settings = response.data.result;
          })
          .catch(() => {
            this.sheetText = 'Cannot get the chat settings.';
            this.isSheetVisible = true;
          });
      },
      async getRooms() {
        const that = this;

        await axios.get(`${apiUrl}/rooms`)
          .then(response => {
            console.log('*** Rooms:', response.data.result)
            that.rooms = response.data.result;
          })
          .catch(() => {
            this.sheetText = 'Cannot get the list of rooms.';
            this.isSheetVisible = true;
          });
      },
      async refreshARoom(roomName) {
        alert('refreshARoom: ' + roomName);
        this.currentRoom = roomName;
        console.log(`currentRoom = ${roomName}`);
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
