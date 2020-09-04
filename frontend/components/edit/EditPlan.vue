<template>
  <div>
    <v-alert
      v-if="alertBox"
      type="info"
      :class="alertBoxColor"
      tile
      dismissible
    >
      {{ createdMessage }}
    </v-alert>
    <v-form v-model="valid">
      <v-text-field
        v-model="plan.id"
        label="Nombre"
        required
        readonly
        disabled
        dense
      />
      <v-text-field
        v-model="plan.name"
        label="Nombre"
        required
        dense
      />
      <v-text-field
        v-model="plan.mikrotik_name"
        label="IP en Mikrotik"
        required
        dense
      />
      <v-btn
        class="mr-4"
        color="success"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="updatePlan"
      >
        Confirmar
      </v-btn>
    </v-form>
  </div>
</template>

<script>
/* eslint-disable vue/prop-name-casing */
import gql from 'graphql-tag'
export default {
  name: 'EditPlan',
  props: {
    plan: {
      type: Object,
      default: () => {},
      id: {
        type: Number,
        default: 0
      },
      name: {
        type: String,
        default: ''
      },
      mikrotik_name: {
        type: String,
        default: ''
      }
    }
  },
  data: () => {
    return {
      valid: false,
      alertBox: false,
      alertBoxColor: '',
      createdMessage: '',
      isSubmitting: false
    }
  },
  methods: {
    updatePlan () {
      this.$apollo.mutate({
        mutation: gql`mutation ($input: PlanInput){
          updatePlan(input: $input){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          input: {
            id: this.plan.id,
            name: this.plan.name,
            mikrotik_name: this.plan.mikrotik_name
          }
        }
      }).then((input) => {
        if (input.data.updatePlan.success) {
          this.$emit('updatePlan', this.plan)
          // window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.updatePlan.errors[0].message
          this.isSubmitting = false
        }
      }).catch((error) => {
        this.alertBox = true
        this.alertBoxColor = 'red darken-4'
        this.createdMessage = error
        this.isSubmitting = false
      })
    }
  }
}
</script>

<style>

</style>
