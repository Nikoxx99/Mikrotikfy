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
              :value="name ? name.toUpperCase() : ''"
              label="Nombre"
              required
              @input="name = $event.toUpperCase()"
            />
            <v-combobox
              v-model="ip"
              label="Ingresa las IP separadas por tabulaciones."
              multiple
              chips
            />
            <v-color-picker
              v-model="color"
              mode="hexa"
              hide-inputs
              flat
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
              <client-only>
                <v-data-table
                  :headers="headers"
                  :items="cities"
                  class="elevation-1"
                >
                  <template v-slot:item.color="{ item }">
                    <svg height="13" width="20">
                      <circle cx="10" cy="8" r="5" :fill="item.color" />
                    </svg>
                  </template>
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
              </client-only>
            </v-card>
          </v-container>
        </v-row>
      </v-container>
    </form>
  </v-card>
</template>

<script>
import gqlt from 'graphql-tag'
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
    color: '',
    hint: 'Es la ip de la mikrotik a la que apunta',
    cities: [],
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false,
    headers: [
      { text: 'Nombre', value: 'name' },
      { text: 'IP Mikrotik', value: 'ip' },
      { text: 'Telegram', value: 'telegrambot.name' },
      { text: 'Color', value: 'color' },
      { text: 'A.', value: 'actions' }
    ],
    editedIndex: -1,
    edit: {
      cities: {
        id: 0,
        name: '',
        ip: '',
        color: '',
        telegrambot: ''
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
      query: gqlt`query ($limit: Int){
        cities(limit: $limit){
          id
          name
          ip
          color
          telegrambot{
            name
          }
        }
      }`,
      variables: {
        limit: 1000
      }
    }).then((input) => {
      this.cities = input.data.cities
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
        mutation: gqlt`mutation ($input: createCityInput){
          createCity(input: $input){
            city {
              name
            }
          }
        }`,
        variables: {
          input: {
            data: {
              name: this.name,
              ip: this.ip,
              color: this.color
            }
          }
        }
      }).then((input) => {
        if (input.data.createCity.city.name) {
          this.alertBox = true
          this.alertBoxColor = 'info darken-4'
          this.createdMessage = 'Ciudad creada con exito'
          this.isSubmitting = false
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
