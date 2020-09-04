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
              v-model="mikrotik_name"
              label="Nombre Mikrotik"
              :hint="hint"
              persistent-hint
              required
            />
            <v-btn
              class="mr-4 blue darken-4"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="createPlan"
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
                Planes
              </v-card-title>
              <v-data-table
                :headers="headers"
                :items="plans"
                class="elevation-1"
              >
                <template v-slot:item.actions="{ item }">
                  <v-dialog v-model="dialogEdit" max-width="500px" :retain-focus="false">
                    <v-card>
                      <v-card-title>
                        <span class="headline">Editar Planes</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container>
                          <EditPlan
                            v-bind="edit"
                            @updatePlan="updatePlan($event)"
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
                  <ModalDeletePlan :name="item.name" :planid="item.id" />
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
import EditPlan from '../edit/EditPlan'
import ModalDeletePlan from '../delete/ModalDeletePlan'
export default {
  name: 'CreatePlan',
  components: {
    EditPlan,
    ModalDeletePlan
  },
  data: () => ({
    id: 0,
    name: '',
    mikrotik_name: '',
    hint: 'Es el nombre tal cual aparece en la Mikrotik',
    plans: [],
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false,
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nombre', value: 'name' },
      { text: 'Nombre Mikrotik', value: 'mikrotik_name' },
      { text: 'A.', value: 'actions' }
    ],
    editedIndex: -1,
    edit: {
      plan: {
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
      this.createdMessage = 'Plan creado correctamente.'
    }
    this.$apollo.query({
      query: gql`query ($limit: Int){
        Plans(limit: $limit){
          id
          name
          mikrotik_name
        }
      }`,
      variables: {
        limit: 1000
      }
    }).then((input) => {
      this.plans = input.data.Plans
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  methods: {
    editItem (item) {
      this.editedIndex = this.plans.indexOf(item)
      this.edit.plan = Object.assign({}, item)
      this.dialogEdit = true
    },
    updatePlan (input) {
      if (this.editedIndex > -1) {
        Object.assign(this.plans[this.editedIndex], input)
      } else {
        this.plans.push(input)
      }
      this.dialogEdit = false
    },
    createPlan () {
      this.isSubmitting = !this.isSubmitting
      this.$apollo.mutate({
        mutation: gql`mutation ($input: PlanInput){
          createPlan(input: $input){
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
            mikrotik_name: this.mikrotik_name
          }
        }
      }).then((input) => {
        if (input.data.createPlan.success) {
          window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.createPlan.errors[0].message
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
