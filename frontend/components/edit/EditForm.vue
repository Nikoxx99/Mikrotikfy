<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-bind="attrs"
          color="yellow darken-4"
          v-on="on"
          @click="dialogEdit = true"
        >
          mdi-pencil
        </v-icon>
      </template>
      <span>Editar Cliente</span>
    </v-tooltip>
    <v-dialog v-if="dialogEdit" v-model="dialogEdit" max-width="1100px" :retain-focus="false" :fullscreen="getResolution()">
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
                    :disabled="!can('EditFormCode')"
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
                    :disabled="!can('EditFormDni')"
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
                :disabled="!can('EditFormName')"
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
                    :disabled="!can('EditFormAddress')"
                    label="Direccion"
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
                <v-col cols="6" lg="3" md="3">
                  <v-autocomplete
                    v-model="item.neighborhood"
                    :disabled="!can('EditFormNeighborhood')"
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
                    :disabled="!can('EditFormPhone')"
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
                    :disabled="!can('EditFormPlan')"
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
                    :disabled="!can('EditFormWifiSsid')"
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
                    :disabled="!can('EditFormWifiPassword')"
                    :type="!can('EditFormWifiPasswordVisibility') ? 'password' : 'text'"
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
                    :disabled="!can('EditFormTechnology')"
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
                    :disabled="!can('EditFormMacAddress')"
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
                    :disabled="!can('EditFormNewModel')"
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
                    :value="item.nap_onu_address ? item.nap_onu_address.toUpperCase() : ''"
                    label="Direccion NAP/ONU"
                    outlined
                    dense
                    hide-details
                    @input="item.nap_onu_address = $event.toUpperCase()"
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    :value="item.opticalPower ? item.opticalPower.toUpperCase() : ''"
                    label="Potencia Óptica (Solo numeros)"
                    outlined
                    dense
                    type="number"
                    hide-details
                    @input="item.opticalPower = $event.toUpperCase()"
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
                <!-- <v-col>
                  <v-text-field
                    :value="item.operator.username"
                    label="Creado por"
                    required
                    outlined
                    dense
                    readonly
                    disabled
                    hide-details
                  />
                </v-col> -->
              </v-row>
              <div v-if="can('EditFormComment')">
                <v-textarea
                  v-model="item.comment"
                  auto-grow
                  persistent-hint
                  outlined
                  label="Comentario Local (Solo API)"
                  dense
                  readonly
                  disabled
                />
              </div>
              <v-switch v-model="item.hasRepeater" hide-details input-value="false" label="Tiene repetidor?" />
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn
            class="mr-4"
            color="info"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="updateClient()"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
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
    },
    role: {
      type: Array,
      default: () => []
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
      commentLoading: false
      // item: {
      //   operator: {
      //     username: 'No registra'
      //   }
      // }
    }
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
              operator: this.$store.state.auth.id,
              hasRepeater: this.item.hasRepeater,
              nap_onu_address: this.item.nap_onu_address,
              opticalPower: this.item.opticalPower,
              newModel: this.item.newModel
            }
          }
        }
      }).then((input) => {
        if (input.data.updateClient.client.id) {
          // this.$emit('updateClient', this.item, this.editIndex)
          this.dialogEdit = false
          this.isSubmitting = false
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
    },
    can (component) {
      // eslint-disable-next-line camelcase
      const allowed_components = this.role
      // eslint-disable-next-line camelcase
      const current_component = component
      return allowed_components.includes(current_component)
    }
  }
}
</script>

<style>

</style>
