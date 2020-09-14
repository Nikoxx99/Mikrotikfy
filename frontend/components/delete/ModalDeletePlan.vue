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
      <span>Borrar Plan</span>
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
            @click="deletePlan(Planid)"
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
    planid: {
      type: Number,
      default: 0
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
    deletePlan (planid) {
      this.$apollo.mutate({
        mutation: gql`mutation ($id: Int){
          deletePlan(id: $id){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          id: this.planid
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
