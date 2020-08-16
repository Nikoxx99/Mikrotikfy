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
              v-model.number="id"
              type="number"
              label="ID"
              required
            />
            <v-text-field
              v-model="name"
              label="Nombre"
              required
            />
            <v-btn
              class="mr-4 blue darken-4"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="createNeighborhood"
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
                Barrios
              </v-card-title>
              <v-list
                rounded
                shaped
              >
                <v-list-item
                  v-for="neighborhood in neighborhoods"
                  :key="neighborhood.id"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ neighborhood.name }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-container>
        </v-row>
      </v-container>
    </form>
  </v-card>
</template>

<script>
import gql from 'graphql-tag'
export default {
  name: 'CreateNeighborhood',
  data: () => ({
    id: 0,
    name: '',
    neighborhoods: [],
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false
  }),
  created () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'blue darken-4'
      this.createdMessage = 'Barrio creado correctamente.'
    }
    this.$apollo.query({
      query: gql`query ($limit: Int){
        Neighborhoods(limit: $limit){
          id
          name
        }
      }`,
      variables: {
        limit: 1000
      }
    }).then((input) => {
      this.neighborhoods = input.data.Neighborhoods
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  methods: {
    createNeighborhood () {
      this.isSubmitting = !this.isSubmitting
      this.$apollo.mutate({
        mutation: gql`mutation ($input: NeighborhoodInput){
          createNeighborhood(input: $input){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          input: {
            id: this.id,
            name: this.name
          }
        }
      }).then((input) => {
        if (input.data.createNeighborhood.success) {
          window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.createNeighborhood.errors[0].message
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
