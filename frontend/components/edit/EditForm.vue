<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-bind="attrs"
          color="yellow darken-4"
          v-on="on"
          @click="dialogEdit = true, createModal()"
        >
          mdi-pencil
        </v-icon>
      </template>
      <span>Editar Cliente</span>
    </v-tooltip>
    <v-dialog v-if="dialogEdit" v-model="dialogEdit" max-width="800px" :retain-focus="false" :fullscreen="getResolution()">
      <v-card>
        <v-card-title>
          <v-toolbar
            dark
          >
            <v-btn
              icon
              dark
              @click="dialogEdit = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>Editar Cliente</v-toolbar-title>
          </v-toolbar>
        </v-card-title>
        <v-card-text>
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
            <v-form v-model="valid">
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="item.code"
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
                    v-model="item.dni"
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
                v-model="item.name"
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
                    v-model="item.address"
                    label="Direccion"
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
                <v-col cols="6" lg="3" md="3">
                  <v-autocomplete
                    v-model="item.neighborhood"
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
                    v-model="item.city"
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
                    v-model="item.phone"
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
                    v-model="item.plan"
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
                    v-model="item.wifi_ssid"
                    label="Nombre de Red"
                    required
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
                <v-col cols="6" lg="4" md="4">
                  <v-text-field
                    v-model="item.wifi_password"
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
                    v-model="item.technology"
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
                    v-model="item.mac_address"
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
                    v-model="item.newModel"
                    :items="idwith"
                    item-text="name"
                    item-value="id"
                    mandatory
                    label="Identificar con:"
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    :value="getDate(item.createdAt)"
                    label="Fecha de Creación"
                    required
                    outlined
                    dense
                    readonly
                    disabled
                    hide-details
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    :value="getDate(item.updatedAt)"
                    label="Última actualización"
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
                v-model="item.comment"
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
                :color="item.citycolor"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                @click="updateClient"
              >
                Editar Cliente
              </v-btn>
            </v-form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </span>
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
    item: {
      type: Object,
      default: () => {}
    },
    dataTable: {
      type: Array,
      default: () => []
    },
    editIdex: {
      type: Number,
      default: 0
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
      dialogEdit: false,
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
      commentLoading: false,
      client: {
        Client: {
          code: 1,
          name: '',
          dni: '',
          address: '',
          neighborhood: 0,
          city: 0,
          phone: '',
          plan: 0,
          wifi_ssid: '',
          wifi_password: '',
          technology: '',
          mac_address: '',
          comment: '',
          created_at: '',
          newModel: 0,
          citycolor: '1'
        }
      }
    }
  },
  methods: {
    createModal () {
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
          id: this.item._id
        }
      }).then((input) => {
        console.log('this')
        this.commentLoading = false
        this.commentDisabled = false
        this.item.comment = input.data.getClientComment.comment
        this.$emit('updateComment', this.item.comment)
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
              id: this.item._id
            },
            data: {
              code: this.item.code,
              name: this.item.name,
              dni: this.item.dni,
              address: this.item.address,
              neighborhood: this.item.neighborhood.id,
              phone: this.item.phone,
              plan: this.item.plan.id,
              technology: this.item.technology.id,
              wifi_ssid: this.item.wifi_ssid,
              wifi_password: this.item.wifi_password,
              mac_address: this.item.mac_address,
              comment: this.item.comment,
              operator: this.item.operator,
              newModel: this.item.newModel
            }
          }
        }
      }).then((input) => {
        if (input.data.updateClient.client.id) {
          this.$emit('updateClient', this.item, this.editIndex)
          this.dialogEdit = false
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
      const dateObject = new Date(date)
      const humanDateFormat = dateObject.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
      return humanDateFormat
    },
    getResolution () {
      const res = document.body.clientWidth
      if (res < 800) {
        const clientRes = true
        return clientRes
      } else {
        const clientRes = false
        return clientRes
      }
    }
  }
}
</script>

<style>

</style>
