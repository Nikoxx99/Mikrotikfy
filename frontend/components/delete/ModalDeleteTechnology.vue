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
      <span>Borrar Tecnologia</span>
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
            @click="deleteTechnology(technologyid)"
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
  props: {
    technologyid: {
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
    deleteTechnology (technologyid) {
      this.$apollo.mutate({
        mutation: gqlt`mutation ($id: Int){
          deleteTechnology(id: $id){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          id: this.technologyid
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
