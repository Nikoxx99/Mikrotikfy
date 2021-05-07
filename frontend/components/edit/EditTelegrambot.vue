<template>
  <div>
    <v-alert
      v-if="alertBox"
      type="info"
      :class="alertBoxColor"
      tile
      dismissible
    >
      {{ createdMessage }}
    </v-alert>
    <v-form v-model="valid">
      <v-text-field
        v-model="telegrambot.token"
        label="Token"
        required
        dense
      />
      <v-text-field
        v-model="telegrambot.chat"
        label="Chat ID"
        dense
      />
      <v-btn
        class="mr-4"
        color="success"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="updateTelegrambot"
      >
        Confirmar
      </v-btn>
    </v-form>
  </div>
</template>

<script>
/* eslint-disable vue/prop-name-casing */
import gqlt from 'graphql-tag'
export default {
  name: 'EditTelegrambot',
  props: {
    telegrambot: {
      type: Object,
      default: () => {},
      token: {
        type: String,
        default: ''
      },
      chat: {
        type: Array,
        default: []
      }
    }
  },
  data: () => {
    return {
      valid: false,
      alertBox: false,
      alertBoxColor: '',
      createdMessage: '',
      isSubmitting: false
    }
  },
  methods: {
    updateTelegrambot () {
      this.$apollo.mutate({
        mutation: gqlt`mutation ($input: updateTelegrambotInput){
          updateTelegrambot(input: $input){
            telegrambot {
              name
            }
          }
        }`,
        variables: {
          input: {
            data: {
              token: this.telegrambot.token,
              chat: this.telegrambot.chat
            }
          }
        }
      }).then((input) => {
        if (input.data.updateTelegrambot.telegrambot.token) {
          this.$emit('updateTelegrambot', this.telegrambot)
          // window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.updateTelegrambot.telegrambot.token
          this.isSubmitting = false
        }
      }).catch((error) => {
        this.alertBox = true
        this.alertBoxColor = 'red darken-4'
        this.createdMessage = error
        this.isSubmitting = false
      })
    }
  }
}
</script>

<style>

</style>
