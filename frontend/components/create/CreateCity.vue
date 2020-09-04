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
              <v-data-table
                :headers="headers"
                :items="cities"
                class="elevation-1"
              >
                <template v-slot:item.actions="{ item }">
                  <v-dialog v-model="dialogEdit" max-width="500px" :retain-focus="false">
                    <v-card>
                      <v-card-title>
                        <span class="headline">Editar Ciudades</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container>
                          <EditCity
                            v-bind="edit"
                            @updateCity="updateCity($event)"
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
                    <span>Editar Ciudad</span>
                  </v-tooltip>
                  <ModalDeleteCity :name="item.name" :cityid="item.id" />
                </template>
              </v-data-table>
            </v-card>
          </v-container>
        </v-row>
      </v-container>
    </form>
  </v-card>
</template>

<script>
import gql from 'graphql-tag'
import EditCity from '../edit/EditCity'
import ModalDeleteCity from '../delete/ModalDeleteCity'
export default {
  name: 'CreateCity',
  components: {
    EditCity,
    ModalDeleteCity
  },
  data: () => ({
    id: 0,
    name: '',
    ip: '',
    hint: 'Es la ip de la mikrotik a la que apunta',
    cities: [],
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false,
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nombre', value: 'name' },
      { text: 'IP Mikrotik', value: 'ip' },
      { text: 'A.', value: 'actions' }
    ],
    editedIndex: -1,
    edit: {
      cities: {
        id: 0,
        name: '',
        ip: ''
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
    editItem (item) {
      this.editedIndex = this.cities.indexOf(item)
      this.edit.cities = Object.assign({}, item)
      this.dialogEdit = true
    },
    updateCity (input) {
      if (this.editedIndex > -1) {
        Object.assign(this.cities[this.editedIndex], input)
      } else {
        this.cities.push(input)
      }
      this.dialogEdit = false
    },
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
