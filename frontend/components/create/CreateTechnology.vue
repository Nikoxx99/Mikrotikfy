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
              <client-only>
                <v-data-table
                  :headers="headers"
                  :items="technologies"
                  class="elevation-1"
                >
                  <template v-slot:[`item.actions`]="{ item }">
                    <v-dialog v-model="dialogEdit" max-width="500px" :retain-focus="false">
                      <v-card>
                        <v-card-title>
                          <span class="headline">Editar Tecnologias</span>
                        </v-card-title>
                        <v-card-text>
                          <v-container>
                            <EditTechnology
                              v-bind="edit"
                              @updateTechnology="updateTechnology($event)"
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
                      <span>Editar Tecnologia</span>
                    </v-tooltip>
                    <ModalDeleteTechnology :name="item.name" :technologyid="item.id" />
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
import EditTechnology from '../edit/EditTechnology'
import ModalDeleteTechnology from '../delete/ModalDeleteTechnology'
export default {
  name: 'CreateTechnology',
  components: {
    EditTechnology,
    ModalDeleteTechnology
  },
  data: () => ({
    id: 0,
    name: '',
    technologies: [],
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false,
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nombre', value: 'name' },
      { text: 'A.', value: 'actions' }
    ],
    editedIndex: -1,
    edit: {
      technologies: {
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
      this.createdMessage = 'Technologia creada correctamente.'
    }
    this.$apollo.query({
      query: gqlt`query ($limit: Int){
        technologies(limit: $limit){
          id
          name
        }
      }`,
      variables: {
        limit: 1000
      }
    }).then((input) => {
      this.technologies = input.data.technologies
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  methods: {
    editItem (item) {
      this.editedIndex = this.technologies.indexOf(item)
      this.edit.technologies = Object.assign({}, item)
      this.dialogEdit = true
    },
    updateTechnology (input) {
      if (this.editedIndex > -1) {
        Object.assign(this.technologies[this.editedIndex], input)
      } else {
        this.technologies.push(input)
      }
      this.dialogEdit = false
    },
    createTechnology () {
      this.isSubmitting = !this.isSubmitting
      this.$apollo.mutate({
        mutation: gqlt`mutation ($input: TechnologyInput){
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
