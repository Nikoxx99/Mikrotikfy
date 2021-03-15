<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          class="red darken-4"
          small
          v-on="on"
          @click.stop="modal = true"
        >
          <v-icon>
            mdi-delete-outline
          </v-icon>
        </v-btn>
      </template>
      <span>Borrar Telegrambot</span>
    </v-tooltip>
    <v-dialog
      v-model="modal"
      max-width="490"
    >
      <v-card>
        <v-card-title class="headline">
          Borrar bot?
        </v-card-title>

        <v-card-text>
          Esto puede ser perjudicial para el funcionamiento de la aplicación.
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="green darken-1"
            text
            @click="modal = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="red darken-1"
            text
            @click="deleteTelegrambot(telegrambotid)"
          >
            Borrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import gql from 'graphql-tag'
export default {
  props: {
    telegrambotid: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    modal: false
  }),
  methods: {
    deleteTelegrambot (telegrambotid) {
      this.$apollo.mutate({
        mutation: gql`mutation ($id: ID!){
          deleteTelegrambot(input: {
            where: {
              id: $id
            }
          }){
            telegrambot{
              id
            }
          }
        }`,
        variables: {
          id: telegrambotid
        }
      }).then((input) => {
        window.location.reload(true)
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
