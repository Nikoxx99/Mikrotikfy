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
              <v-list
                rounded
                shaped
              >
                <v-list-item
                  v-for="plan in plans"
                  :key="plan.id"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ plan.name }}</v-list-item-title>
                    <v-list-item-title>{{ plan.mikrotik_name }}</v-list-item-title>
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
  name: 'CreatePlan',
  data: () => ({
    id: 0,
    name: '',
    mikrotik_name: '',
    hint: 'Es el nombre tal cual aparece en la Mikrotik',
    plans: [],
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false
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
