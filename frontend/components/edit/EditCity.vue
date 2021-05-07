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
        v-model="cities.name"
        label="Nombre"
        required
        dense
      />
      <v-combobox
        v-model="cities.ip"
        label="IP en Mikrotik"
        :items="cities.ip"
        dense
        multiple
        chips
      />
      <v-combobox
        v-model="telegrambot"
        label="Bots de Telegram"
        item-value="id"
        item-text="name"
        :items="telegrambots"
        dense
        multiple
        chips
      />
      <v-color-picker
        v-model="cities.color"
        mode="hexa"
        hide-inputs
        flat
      />
      <v-btn
        class="mr-4"
        color="success"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="updateCity"
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
  name: 'EditCity',
  props: {
    cities: {
      type: Object,
      default: () => {},
      id: {
        type: String,
        default: ''
      },
      name: {
        type: String,
        default: ''
      },
      ip: {
        type: Array,
        default: []
      },
      color: {
        type: String,
        default: ''
      },
      telegrambot: {
        type: String,
        default: ''
      }
    }
  },
  data: () => {
    return {
      valid: false,
      alertBox: false,
      alertBoxColor: '',
      createdMessage: '',
      isSubmitting: false,
      telegrambots: [],
      telegrambot: []
    }
  },
  mounted () {
    this.$apollo.query({
      query: gqlt`query ($limit: Int){
        telegrambots(limit: $limit){
          id
          name
          token
          chat
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
    updateCity () {
      this.$apollo.mutate({
        mutation: gqlt`mutation ($input: updateCityInput){
          updateCity(input: $input){
            city {
              name
            }
          }
        }`,
        variables: {
          input: {
            where: {
              id: this.cities.id
            },
            data: {
              name: this.cities.name,
              ip: this.cities.ip,
              color: this.cities.color,
              telegrambot: this.telegrambot[0].id
            }
          }
        }
      }).then((input) => {
        if (input.data.updateCity.city.name) {
          this.$emit('updateCity', this.cities)
          // window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.updateCity.errors[0].message
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
