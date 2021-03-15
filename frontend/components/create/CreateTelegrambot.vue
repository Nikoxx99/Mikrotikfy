<template>
  <v-card>
    <form>
      <v-container>
        <v-alert
          v-if="alertBox"
          type="info"
          :class="alertBoxColor"
          tile
          dismissible
        >
          {{ createdMessage }}
        </v-alert>
        <v-row>
          <v-container>
            <v-text-field
              v-model="name"
              label="Nombre"
              required
            />
            <v-text-field
              v-model="token"
              label="Token"
              required
            />
            <v-text-field
              v-model="chat"
              label="Chat ID"
            />
            <v-text-field
              v-model="binnacle"
              label="Bitacora ID"
            />
            <v-btn
              class="mr-4 blue darken-4"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="createTelegrambot"
            >
              Crear
            </v-btn>
          </v-container>
        </v-row>
        <v-row>
          <v-container>
            <v-card
              tile
            >
              <v-card-title class="blue darken-3">
                Telegram Bots
              </v-card-title>
              <client-only>
                <v-data-table
                  :headers="headers"
                  :items="telegrambots"
                  class="elevation-1"
                >
                  <template v-slot:item.actions="{ item }">
                    <v-dialog v-model="dialogEdit" max-width="500px" :retain-focus="false">
                      <v-card>
                        <v-card-title>
                          <span class="headline">Editar Telegrambot</span>
                        </v-card-title>
                        <v-card-text>
                          <v-container>
                            <EditTelegrambot
                              v-bind="edit"
                              @updateTelegrambot="updateTelegrambot($event)"
                            />
                          </v-container>
                        </v-card-text>
                      </v-card>
                    </v-dialog>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-bind="attrs"
                          class="yellow darken-4"
                          small
                          v-on="on"
                          @click="editItem(item)"
                        >
                          <v-icon>
                            mdi-pencil
                          </v-icon>
                        </v-btn>
                      </template>
                      <span>Editar Telegrambot</span>
                    </v-tooltip>
                    <ModalDeleteTelegrambot :telegrambotid="item.id" />
                  </template>
                </v-data-table>
              </client-only>
            </v-card>
          </v-container>
        </v-row>
      </v-container>
    </form>
  </v-card>
</template>

<script>
import gql from 'graphql-tag'
import EditTelegrambot from '../edit/EditTelegrambot'
import ModalDeleteTelegrambot from '../delete/ModalDeleteTelegrambot'
export default {
  name: 'CreateCity',
  components: {
    EditTelegrambot,
    ModalDeleteTelegrambot
  },
  data: () => ({
    name: '',
    token: '',
    chat: '',
    binnacle: '',
    color: '',
    hint: 'ID del Chat de Telegram al que escribira el Bot',
    telegrambots: [],
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false,
    headers: [
      { text: 'Nombre', value: 'name' },
      { text: 'Token', value: 'token' },
      { text: 'Chat ID', value: 'chat' },
      { text: 'A.', value: 'actions' }
    ],
    editedIndex: -1,
    edit: {
      telegrambots: {
        token: '',
        chat: ''
      }
    },
    dialogEdit: false
  }),
  created () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'blue darken-4'
      this.createdMessage = 'Ciudad creada correctamente.'
    }
    this.$apollo.query({
      query: gql`query ($limit: Int){
        telegrambots(limit: $limit){
          name
          token
          chat
          binnacle
        }
      }`,
      variables: {
        limit: 1000
      }
    }).then((input) => {
      this.telegrambots = input.data.telegrambots
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  methods: {
    editItem (item) {
      this.editedIndex = this.telegrambots.indexOf(item)
      this.edit.telegrambots = Object.assign({}, item)
      this.dialogEdit = true
    },
    updateCity (input) {
      if (this.editedIndex > -1) {
        Object.assign(this.telegrambots[this.editedIndex], input)
      } else {
        this.telegrambots.push(input)
      }
      this.dialogEdit = false
    },
    createTelegrambot () {
      this.isSubmitting = !this.isSubmitting
      this.$apollo.mutate({
        mutation: gql`mutation ($input: createTelegrambotInput){
          createTelegrambot(input: $input){
            telegrambot {
              token
            }
          }
        }`,
        variables: {
          input: {
            data: {
              name: this.name,
              token: this.token,
              chat: this.chat,
              binnacle: this.binnacle
            }
          }
        }
      }).then((input) => {
        if (input.data.createTelegrambot.telegrambot.token) {
          this.alertBox = true
          this.alertBoxColor = 'info darken-4'
          this.createdMessage = 'Bot creado con exito'
          this.isSubmitting = false
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.createTelegrambot.token
          this.isSubmitting = false
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    }
  }
}
</script>

<style>

</style>
