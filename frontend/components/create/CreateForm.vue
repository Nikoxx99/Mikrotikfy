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
            ref="code"
            v-model="Client.code"
            type="number"
            :label="codeSuccess ? 'Código correcto' : 'Código'"
            required
            outlined
            dense
            :error="codeError"
            :success="codeSuccess"
            :hint="d00pHint"
            :hide-details="hideD00pHint"
            :persistent-hint="!hideD00pHint"
            @change="testCodeForDuplicated(Client.code)"
            @keyup="codeSuccess = false, codeError = false, hideD00pHint = true"
          />
        </v-col>
        <v-col>
          <v-text-field
            ref="dni"
            v-model="Client.dni"
            type="number"
            label="Cedula"
            :rules="valid_dni"
            autocomplete="off"
            required
            :valid="true"
            outlined
            dense
            :hide-details="$refs.dni ? $refs.dni.valid ? true : $refs.dni.isFocused ? $refs.dni.badInput ? false : true : $refs.dni.badInput ? false : true : false"
            @keyup="calculateSsid"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            :value="Client.name.toUpperCase()"
            label="Nombre Completo"
            required
            outlined
            dense
            hide-details
            @keyup="calculateSsid"
            @input="Client.name = $event.toUpperCase()"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6" lg="3" md="3">
          <v-select
            v-model="dir1"
            :items="dirFragment1"
            label="Dirección"
            outlined
            dense
            hide-details
            @blur="genAddress"
          />
        </v-col>
        <v-col cols="6" lg="3" md="3">
          <v-text-field
            v-model="dir2"
            label="#"
            outlined
            dense
            hide-details
            @blur="genAddress"
          />
        </v-col>
        <v-col cols="6" lg="3" md="3">
          <v-select
            v-model="dir3"
            :items="dirFragment2"
            label="#"
            value="#"
            outlined
            dense
            hide-details
            @blur="genAddress"
          />
        </v-col>
        <v-col cols="6" lg="3" md="3">
          <v-text-field
            v-model="dir4"
            label="#"
            outlined
            dense
            hide-details
            @blur="genAddress"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-autocomplete
            v-model="Client.neighborhood"
            item-text="name"
            item-value="id"
            :items="neighborhoods"
            label="Barrio"
            outlined
            dense
            hide-details
            return-object
          />
        </v-col>
        <v-col>
          <v-select
            v-model="Client.city"
            item-text="name"
            item-value="id"
            :items="cities"
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
            :items="plans"
            label="Plan"
            outlined
            dense
            hide-details
            return-object
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
      <!-- <v-row>
        <v-col>
          <v-select
            v-model="Client.technology"
            item-text="name"
            item-value="id"
            :items="technologies"
            label="Tecnología"
            outlined
            dense
            hide-details
            return-object
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
      </v-row> -->
      <!-- <v-row>
        <v-col>
          <v-text-field
            :value="Client.nap_onu_address.toUpperCase()"
            label="Direccion NAP/ONU"
            outlined
            dense
            hide-details
            @input="Client.nap_onu_address = $event.toUpperCase()"
          />
        </v-col>
        <v-col>
          <v-text-field
            :value="Client.opticalPower ? Client.opticalPower.toUpperCase() : ''"
            label="Potencia Óptica (Solo numeros)"
            outlined
            dense
            type="number"
            hide-details
            @input="Client.opticalPower = $event.toUpperCase()"
          />
        </v-col>
      </v-row> -->
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
            hide-details
          />
        </v-col>
      </v-row>
      <v-switch v-model="Client.hasRepeater" hide-details input-value="false" label="Tiene repetidor?" />
      <v-switch v-model="Client.sendToMikrotik" input-value="true" label="Crear en Mikrotik?" />
      <v-btn
        class="mr-4"
        :color="citycolor"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="createClient"
      >
        Crear Cliente
      </v-btn>
    </v-form>
  </div>
</template>

<script>
import gqlt from 'graphql-tag'
export default {
  name: 'CreateForm',
  props: {
    citycolor: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      default: ''
    }
  },
  data: () => {
    return {
      valid: false,
      Client: {
        code: '',
        name: '',
        dni: '',
        address: '',
        neighborhood: {
          id: 0,
          name: ''
        },
        city: '',
        phone: '',
        plan: {
          id: 0,
          name: ''
        },
        wifi_ssid: '',
        wifi_password: '',
        technology: {},
        mac_address: '',
        comment: '',
        newModel: 1,
        hasRepeater: false,
        sendToMikrotik: true,
        nap_onu_address: '',
        opticalPower: ''
      },
      dir1: '',
      dir2: '',
      dir3: '#',
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
        'DIAGONAL',
        'LOTE'
      ],
      alertBox: false,
      alertBoxColor: '',
      createdMessage: '',
      isSubmitting: false,
      idwith: [
        { id: 0, name: 'Cedula' },
        { id: 1, name: 'Codigo' }
      ],
      valid_dni: [
        (value) => {
          const pattern = /^[A-Za-z0-9]+$/
          return pattern.test(value) || 'La Cédula/NIT no debe llevar guiónes.'
        }
      ],
      codeError: false,
      hideHint: true,
      hideD00pHint: true,
      d00pHint: '',
      codeSuccess: null
    }
  },
  computed: {
    cities () {
      return this.$store.state.cities
    },
    plans () {
      return this.$store.state.plans
    },
    neighborhoods () {
      return this.$store.state.neighborhoods
    },
    technologies () {
      return this.$store.state.technologies
    }
  },
  mounted () {
    if (this.$route.query.city) {
      this.Client.city = this.$route.query.city
    }
  },
  methods: {
    async testCodeForDuplicated (code) {
      const clients = await this.$strapi.find('clients', {
        code,
        city: this.$route.query.city
      })
      if (clients.length > 0) {
        this.codeError = true
        this.d00pHint = 'Error. El codigo ya existe.'
        this.hideD00pHint = false
      } else {
        this.codeError = false
        this.d00pHint = ''
        this.hideD00pHint = true
        this.codeSuccess = true
      }
    },
    createClient () {
      this.isSubmitting = !this.isSubmitting
      this.$apollo.mutate({
        mutation: gqlt`mutation ($input: createClientInput){
          createClient(input: $input){
            client {
              code
            }
          }
        }`,
        variables: {
          input: {
            data: {
              code: this.Client.code,
              name: this.Client.name,
              dni: this.Client.dni,
              address: this.Client.address,
              neighborhood: this.Client.neighborhood.id,
              city: this.Client.city,
              phone: this.Client.phone,
              plan: this.Client.plan.id,
              wifi_ssid: this.Client.wifi_ssid,
              wifi_password: this.Client.wifi_password,
              comment: this.Client.comment,
              newModel: this.Client.newModel,
              sendToMikrotik: this.Client.sendToMikrotik,
              hasRepeater: this.Client.hasRepeater,
              operator: this.$store.state.auth.id,
              operator_role: this.role
            }
          }
        }
      }).then((input) => {
        if (input.data.createClient.code !== '0') {
          this.$emit('createClient', this.Client)
          this.$emit('createClientDialog', false)
          this.$emit('createClientSnack', true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = 'Error al crear el cliente. Reporta esto al gestor web'
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
    calculateSsid () {
      const name = this.Client.name.split(' ')
      const length = name.length
      // eslint-disable-next-line no-var
      var lastNameLowerCase = ''
      switch (length) {
        case 1:
          break
        case 2:
          lastNameLowerCase = name[1].toLowerCase()
          break
        case 3:
          lastNameLowerCase = name[1].toLowerCase()
          break
        case 4:
          lastNameLowerCase = name[2].toLowerCase()
          break
        default:
          lastNameLowerCase = ''
          break
      }
      const nombreLowerCase = name[0].toLowerCase()
      const processedName = nombreLowerCase.charAt(0).toUpperCase() + nombreLowerCase.slice(1)
      this.Client.wifi_password = processedName + this.Client.code
      this.Client.wifi_ssid = `ARNOP${lastNameLowerCase.charAt(0).toUpperCase() + lastNameLowerCase.slice(1)}`
    }
  }
}
</script>

<style>

</style>
