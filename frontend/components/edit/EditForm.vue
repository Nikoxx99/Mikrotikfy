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
            v-model="Client.code"
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
      <v-row>
        <v-col cols="6" lg="3" md="3">
          <v-text-field
            v-model="Client.address"
            label="Direccion"
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col cols="6" lg="3" md="3">
          <v-autocomplete
            v-model="Client.neighborhood"
            item-text="name"
            item-value="id"
            :items="neighborhoods"
            return-object
            label="Barrio"
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col cols="6" lg="3" md="3">
          <v-select
            v-model="Client.city"
            item-text="name"
            item-value="id"
            :items="cities"
            return-object
            label="Ciudad"
            disabled
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col cols="6" lg="3" md="3">
          <v-text-field
            v-model="Client.phone"
            label="Telefono"
            required
            outlined
            dense
            hide-details
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" lg="4" md="4">
          <v-select
            v-model="Client.plan"
            item-text="name"
            item-value="id"
            :items="plans"
            return-object
            label="Plan"
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col cols="6" lg="4" md="4">
          <v-text-field
            v-model="Client.wifi_ssid"
            label="Nombre de Red"
            required
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col cols="6" lg="4" md="4">
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
            :items="technologies"
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
      <v-row>
        <v-col>
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
        </v-col>
        <v-col>
          <v-text-field
            :value="getDate(Client.created_at)"
            label="Fecha de Creación"
            required
            outlined
            dense
            readonly
            disabled
            hide-details
          />
        </v-col>
      </v-row>
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
      <v-btn
        class="mr-4"
        :color="Client.citycolor"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="updateClient"
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
    cities () {
      return {
        query: gql`
        query{
          cities{
            id
            name
          }
        }
      `
      }
    },
    neighborhoods () {
      return {
        query: gql`
        query{
          neighborhoods{
            id
            name
          }
        }
      `
      }
    },
    plans () {
      return {
        query: gql`
        query{
          plans{
            id
            name
          }
        }
      `
      }
    },
    technologies () {
      return {
        query: gql`
        query{
          technologies{
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
        type: String,
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
  mounted () {
    this.success = false
    this.error = false
    this.commentLoading = true
    this.commentDisabled = true
    this.$apollo.query({
      query: gql`query ($id: ID){
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
      this.commentLoading = false
      this.commentDisabled = false
      this.error = true
      this.errorMessage = 'Comentario no sincronizado'
      // eslint-disable-next-line no-console
      console.log(error)
    })
  },
  methods: {
    updateClient () {
      this.isSubmitting = true
      this.$apollo.mutate({
        mutation: gql`mutation ($input: updateClientInput){
          updateClient(input: $input){
            client{
              id
            }
          }
        }`,
        variables: {
          input: {
            where: {
              id: this.Client._id
            },
            data: {
              code: this.Client.code,
              name: this.Client.name,
              dni: this.Client.dni,
              address: this.Client.address,
              neighborhood: this.Client.neighborhood.id,
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
        }
      }).then((input) => {
        if (input.data.updateClient.client.id) {
          this.$emit('updateClient', this.Client)
          // window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.updateClient.errors[0].message
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
