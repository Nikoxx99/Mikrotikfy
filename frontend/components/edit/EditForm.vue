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
      <v-row>
        <v-col>
          <v-text-field
            v-model.number="Client.code"
            type="number"
            label="Codigo"
            required
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col>
          <v-text-field
            v-model="Client.dni"
            type="number"
            label="Cedula"
            required
            outlined
            dense
            hide-details
          />
        </v-col>
      </v-row>
      <v-text-field
        v-model="Client.name"
        label="Nombre Completo"
        required
        outlined
        dense
        hide-details
        class="pb-3"
      />
      <v-text-field
        v-model="Client.address"
        label="Direccion"
        outlined
        dense
        hide-details
      />
      <v-row>
        <v-col>
          <v-autocomplete
            v-model="Client.neighborhood"
            item-text="name"
            item-value="id"
            :items="Neighborhoods"
            return-object
            label="Barrio"
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col>
          <v-select
            v-model="Client.city"
            item-text="name"
            item-value="id"
            :items="Cities"
            return-object
            label="Ciudad"
            disabled
            outlined
            dense
            hide-details
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="Client.phone"
            label="Telefono"
            required
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col>
          <v-select
            v-model="Client.plan"
            item-text="name"
            item-value="id"
            :items="Plans"
            return-object
            label="Plan"
            outlined
            dense
            hide-details
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="Client.wifi_ssid"
            label="Nombre de Red"
            required
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col>
          <v-text-field
            v-model="Client.wifi_password"
            label="Clave de Red"
            required
            outlined
            dense
            hide-details
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            v-model="Client.technology"
            item-text="name"
            item-value="id"
            :items="Technologies"
            return-object
            label="Tecnología"
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col>
          <v-text-field
            v-model="Client.mac_address"
            label="Mac Equipo"
            required
            outlined
            dense
            hide-details
          />
        </v-col>
      </v-row>
      <v-select
        v-model="Client.newModel"
        :items="idwith"
        item-text="name"
        item-value="id"
        mandatory
        label="Identificar con:"
        outlined
        dense
      />
      <v-textarea
        v-model="Client.comment"
        auto-grow
        :success.sync="success"
        :success-messages="successMessage"
        :error="error"
        :error-messages="errorMessage"
        :loading="commentLoading"
        :disabled="commentDisabled"
        persistent-hint
        outlined
        label="Comentario"
        dense
      />
      <v-text-field
        :value="getDate(Client.created_at)"
        label="Fecha de Creación"
        required
        outlined
        dense
        readonly
        disabled
        hide-details
        class="py-3"
      />
      <v-btn
        class="mr-4"
        :color="Client.citycolor"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="editClient"
      >
        Editar Cliente
      </v-btn>
    </v-form>
  </div>
</template>

<script>
/* eslint-disable vue/prop-name-casing */
import gql from 'graphql-tag'
export default {
  name: 'EditForm',
  apollo: {
    Cities () {
      return {
        query: gql`
        query{
          Cities{
            id
            name
          }
        }
      `
      }
    },
    Neighborhoods () {
      return {
        query: gql`
        query{
          Neighborhoods{
            id
            name
          }
        }
      `
      }
    },
    Plans () {
      return {
        query: gql`
        query{
          Plans{
            id
            name
          }
        }
      `
      }
    },
    Technologies () {
      return {
        query: gql`
        query{
          Technologies{
            id
            name
          }
        }
      `
      }
    }
  },
  props: {
    Client: {
      type: Object,
      default: () => {},
      _id: {
        type: String,
        default: ''
      },
      code: {
        type: Number,
        default: 1
      },
      name: {
        type: String,
        default: ''
      },
      dni: {
        type: String,
        default: ''
      },
      address: {
        type: String,
        default: ''
      },
      neighborhood: {
        type: Object,
        default: () => { this.neighborhood = 1 },
        id: {
          type: Number,
          default: 1
        },
        name: {
          type: String,
          default: ''
        }
      },
      city: {
        type: Object,
        default: () => {},
        id: {
          type: Number,
          default: 0
        },
        name: {
          type: String,
          default: ''
        }
      },
      phone: {
        type: String,
        default: ''
      },
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
        }
      },
      wifi_ssid: {
        type: String,
        default: ''
      },
      wifi_password: {
        type: String,
        default: ''
      },
      technology: {
        type: Object,
        default: () => {},
        id: {
          type: Number,
          default: 0
        },
        name: {
          type: String,
          default: ''
        }
      },
      mac_address: {
        type: String,
        default: ''
      },
      comment: {
        type: String,
        default: ''
      },
      created_at: {
        type: String,
        default: ''
      },
      newModel: {
        type: Number,
        default: 1
      },
      citycolor: {
        type: String,
        default: ''
      }
    }
  },
  data: () => {
    return {
      valid: false,
      dir1: '',
      dir2: '',
      dir3: '',
      dir4: '',
      dirFragment1: [
        '(SIN INICIAL)',
        'CARRERA',
        'CALLE',
        'MANZANA',
        'DIAGONAL'
      ],
      dirFragment2: [
        '#',
        'CASA',
        'DIAGONAL'
      ],
      alertBox: false,
      alertBoxColor: '',
      createdMessage: '',
      isSubmitting: false,
      idwith: [
        { id: 0, name: 'Cedula' },
        { id: 1, name: 'Codigo' }
      ],
      success: false,
      error: false,
      commentDisabled: false,
      successMessage: '',
      errorMessage: '',
      commentLoading: false
    }
  },
  watch: {
    Client: {
      immediate: true,
      handler () {
        this.success = false
        this.error = false
        this.commentLoading = true
        this.commentDisabled = true
        this.isSubmitting = false
        this.$apollo.mutate({
          mutation: gql`mutation ($id: ID){
            getClientComment(id: $id){
              comment
            }
          }`,
          variables: {
            id: this.Client._id
          }
        }).then((input) => {
          this.Client.comment = input.data.getClientComment.comment
          this.$emit('updateComment', this.Client.comment)
          this.commentLoading = false
          this.commentDisabled = false
          this.success = true
          this.successMessage = 'Comentario sincronizado con la Mikrotik'
          this.error = false
        }).catch((error) => {
          this.success = false
          this.error = true
          this.errorMessage = 'Comentario no sincronizado'
          // eslint-disable-next-line no-console
          console.log(error)
        })
      }
    }
  },
  mounted () {
    this.success = false
    this.error = false
    this.commentLoading = true
    this.commentDisabled = true
    this.$apollo.mutate({
      mutation: gql`mutation ($id: ID){
        getClientComment(id: $id){
          comment
        }
      }`,
      variables: {
        id: this.Client._id
      }
    }).then((input) => {
      this.commentLoading = false
      this.commentDisabled = false
      this.Client.comment = input.data.getClientComment.comment
      this.$emit('updateComment', this.Client.comment)
      this.success = true
      this.successMessage = 'Comentario sincronizado con la Mikrotik'
      this.error = false
    }).catch((error) => {
      this.success = false
      this.error = true
      this.errorMessage = 'Comentario no sincronizado'
      // eslint-disable-next-line no-console
      console.log(error)
    })
  },
  methods: {
    editClient () {
      this.isSubmitting = true
      this.$apollo.mutate({
        mutation: gql`mutation ($input: EditClientInput){
          editClient(input: $input){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          input: {
            _id: this.Client._id,
            code: this.Client.code,
            name: this.Client.name,
            dni: this.Client.dni,
            address: this.Client.address,
            neighborhood: this.Client.neighborhood.id,
            city: this.Client.city.id,
            phone: this.Client.phone,
            plan: this.Client.plan.id,
            technology: this.Client.technology.id,
            wifi_ssid: this.Client.wifi_ssid,
            wifi_password: this.Client.wifi_password,
            mac_address: this.Client.mac_address,
            comment: this.Client.comment,
            operator: this.Client.operator,
            newModel: this.Client.newModel
          }
        }
      }).then((input) => {
        if (input.data.editClient.success) {
          this.$emit('updateClient', this.Client)
          // window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.editClient.errors[0].message
          this.isSubmitting = false
        }
      }).catch((error) => {
        this.alertBox = true
        this.alertBoxColor = 'red darken-4'
        this.createdMessage = error
        this.isSubmitting = false
      })
    },
    genAddress () {
      this.Client.address = `${this.dir1} ${this.dir2} ${this.dir3} ${this.dir4}`
    },
    getDate (date) {
      const dateObject = new Date(parseInt(date))
      const humanDateFormat = dateObject.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
      return humanDateFormat
    }
  }
}
</script>

<style>

</style>
