<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-bind="attrs"
          color="red darken-4"
          v-on="on"
          @click.stop="modal = true"
        >
          mdi-delete-outline
        </v-icon>
      </template>
      <span>Borrar Cliente</span>
    </v-tooltip>
    <v-dialog
      v-model="modal"
      max-width="490"
    >
      <v-card>
        <v-card-title class="headline">
          Borrar {{ name }}?
        </v-card-title>

        <v-card-text>
          Esta acción no se puede revertir. ¿Desea proceder?
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="green darken-1"
            text
            @click="modal = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="red darken-1"
            text
            @click="deleteClient(clientid)"
          >
            Borrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import gqlt from 'graphql-tag'
export default {
  name: 'DeleteClient',
  props: {
    clientid: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    modal: false
  }),
  methods: {
    deleteClient (clientid) {
      this.$apollo.mutate({
        mutation: gqlt`mutation ($input: deleteClientInput){
          deleteClient(input: $input){
            client {
              id
            }
          }
        }`,
        variables: {
          input: {
            where: {
              id: this.clientid
            }
          }
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
