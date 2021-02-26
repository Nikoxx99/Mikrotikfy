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
              <client-only>
                <v-data-table
                  :headers="headers"
                  :items="neighborhoods"
                  sort-by="calories"
                  class="elevation-1"
                >
                  <template v-slot:item.actions="{ item }">
                    <v-dialog v-model="dialogEdit" max-width="500px" :retain-focus="false">
                      <v-card>
                        <v-card-title>
                          <span class="headline">Editar Barrio</span>
                        </v-card-title>
                        <v-card-text>
                          <v-container>
                            <EditNeighborhood
                              v-bind="edit"
                              @updateNeighborhood="updateNeighborhood($event)"
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
                      <span>Editar Barrio</span>
                    </v-tooltip>
                    <ModalDeleteNeighborhood :name="item.name" :neighborhoodid="item.id" />
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
import gql from 'graphql-tag'
import EditNeighborhood from '../edit/EditNeighborhood'
import ModalDeleteNeighborhood from '../delete/ModalDeleteNeighborhood'
export default {
  name: 'CreateNeighborhood',
  components: {
    EditNeighborhood,
    ModalDeleteNeighborhood
  },
  data: () => ({
    id: 0,
    name: '',
    neighborhoods: [],
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false,
    headers: [
      { text: 'Nombre', value: 'name' },
      { text: 'A.', value: 'actions' }
    ],
    editedIndex: -1,
    edit: {
      neighborhoods: {
        id: 0,
        name: ''
      }
    },
    dialogEdit: false
  }),
  created () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'blue darken-4'
      this.createdMessage = 'Barrio creado correctamente.'
    }
    this.$apollo.query({
      query: gql`query ($limit: Int){
        neighborhoods(limit: $limit){
          id
          name
        }
      }`,
      variables: {
        limit: 1000
      }
    }).then((input) => {
      this.neighborhoods = input.data.neighborhoods
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  methods: {
    editItem (item) {
      this.editedIndex = this.neighborhoods.indexOf(item)
      this.edit.neighborhoods = Object.assign({}, item)
      this.dialogEdit = true
    },
    updateNeighborhood (input) {
      if (this.editedIndex > -1) {
        Object.assign(this.neighborhoods[this.editedIndex], input)
      } else {
        this.neighborhoods.push(input)
      }
      this.dialogEdit = false
    },
    createNeighborhood () {
      this.isSubmitting = !this.isSubmitting
      this.$apollo.mutate({
        mutation: gql`mutation ($input: createNeighborhoodInput){
          createNeighborhood(input: $input){
            neighborhood{
              name
            }
          }
        }`,
        variables: {
          input: {
            data: {
              name: this.name
            }
          }
        }
      }).then((input) => {
        if (input.data.createNeighborhood.neighborhood.name) {
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
