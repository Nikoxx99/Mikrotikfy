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
        v-model="technologies.id"
        label="Nombre"
        required
        readonly
        disabled
        dense
      />
      <v-text-field
        v-model="technologies.name"
        label="Nombre"
        required
        dense
      />
      <v-btn
        class="mr-4"
        color="success"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="updateTechnology"
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
  name: 'EditTechnology',
  props: {
    technologies: {
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
      ip: {
        type: Number,
        default: 1
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
    updateTechnology () {
      this.$apollo.mutate({
        mutation: gql`mutation ($input: TechnologyInput){
          updateTechnology(input: $input){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          input: {
            id: this.technologies.id,
            name: this.technologies.name
          }
        }
      }).then((input) => {
        if (input.data.updateTechnology.success) {
          this.$emit('updateTechnology', this.technologies)
          // window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.updateTechnology.errors[0].message
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
