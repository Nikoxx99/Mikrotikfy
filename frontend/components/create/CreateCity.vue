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
            <v-text-field
              v-model="ip"
              label="IP"
              :hint="hint"
              persistent-hint
              required
            />
            <v-btn
              class="mr-4 blue darken-4"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="createCity"
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
                Ciudades
              </v-card-title>
              <v-list
                rounded
                shaped
              >
                <v-list-item
                  v-for="city in cities"
                  :key="city.id"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ city.name }}</v-list-item-title>
                    <v-list-item-title>{{ city.ip }}</v-list-item-title>
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
  name: 'CreateCity',
  data: () => ({
    id: 0,
    name: '',
    ip: '',
    hint: 'Es la ip de la mikrotik a la que apunta',
    cities: [],
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false
  }),
  created () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'blue darken-4'
      this.createdMessage = 'Ciudad creada correctamente.'
    }
    this.$apollo.query({
      query: gql`query ($limit: Int){
        Cities(limit: $limit){
          id
          name
          ip
        }
      }`,
      variables: {
        limit: 1000
      }
    }).then((input) => {
      this.cities = input.data.Cities
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  methods: {
    createCity () {
      this.isSubmitting = !this.isSubmitting
      this.$apollo.mutate({
        mutation: gql`mutation ($input: CityInput){
          createCity(input: $input){
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
            name: this.name,
            ip: this.ip
          }
        }
      }).then((input) => {
        if (input.data.createCity.success) {
          window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.createCity.errors[0].message
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
