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
        v-model="neighborhoods.id"
        label="ID"
        required
        readonly
        disabled
        dense
      />
      <v-text-field
        v-model="neighborhoods.name"
        label="Nombre"
        required
        dense
      />
      <v-btn
        class="mr-4"
        color="success"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="updateNeighborhood"
      >
        Confirmar
      </v-btn>
    </v-form>
  </div>
</template>

<script>
/* eslint-disable vue/prop-name-casing */
import gqlt from 'graphql-tag'
export default {
  name: 'EditNeighborhood',
  props: {
    neighborhoods: {
      type: Object,
      default: () => {},
      id: {
        type: String,
        default: 0
      },
      name: {
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
    updateNeighborhood () {
      this.$apollo.mutate({
        mutation: gqlt`mutation ($input: NeighborhoodInput){
          updateNeighborhood(input: $input){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          input: {
            id: this.neighborhoods.id,
            name: this.neighborhoods.name,
            ip: this.neighborhoods.ip
          }
        }
      }).then((input) => {
        if (input.data.updateNeighborhood.success) {
          this.$emit('updateNeighborhood', this.neighborhoods)
          // window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.updateNeighborhood.errors[0].message
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
