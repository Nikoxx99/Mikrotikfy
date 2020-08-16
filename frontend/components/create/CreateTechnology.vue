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
              @click="createTechnology"
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
                Tecnologias
              </v-card-title>
              <v-list
                rounded
                shaped
              >
                <v-list-item
                  v-for="technology in technologies"
                  :key="technology.id"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ technology.name }}</v-list-item-title>
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
  name: 'CreateTechnology',
  data: () => ({
    id: 0,
    name: '',
    technologies: [],
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false
  }),
  created () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'blue darken-4'
      this.createdMessage = 'Technologia creada correctamente.'
    }
    this.$apollo.query({
      query: gql`query ($limit: Int){
        Technologies(limit: $limit){
          id
          name
        }
      }`,
      variables: {
        limit: 1000
      }
    }).then((input) => {
      this.technologies = input.data.Technologies
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  methods: {
    createTechnology () {
      this.isSubmitting = !this.isSubmitting
      this.$apollo.mutate({
        mutation: gql`mutation ($input: TechnologyInput){
          createTechnology(input: $input){
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
        if (input.data.createTechnology.success) {
          window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.createTechnology.errors[0].message
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
