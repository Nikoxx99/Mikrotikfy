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
      />
      <v-row>
        <v-col>
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
        <v-col>
          <v-text-field
            v-model="dir2"
            label="#"
            outlined
            dense
            hide-details
            @blur="genAddress"
          />
        </v-col>
        <v-col>
          <v-select
            v-model="dir3"
            :items="dirFragment2"
            label="#"
            outlined
            dense
            hide-details
            @blur="genAddress"
          />
        </v-col>
        <v-col>
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
            :items="Neighborhoods"
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
      <v-textarea
        v-model="Client.comment"
        outlined
        label="Comentario"
        dense
      />
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
      <v-checkbox v-model="Client.sendToMikrotik" input-value="true" label="Crear en Mikrotik?" />
      <v-btn
        class="mr-4"
        color="primary"
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
import gql from 'graphql-tag'
export default {
  name: 'CreateForm',
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
  data: () => {
    return {
      valid: false,
      Client: {
        code: '',
        name: '',
        dni: '',
        address: '',
        neighborhood: '',
        city: 1,
        phone: '',
        plan: '',
        wifi_ssid: '',
        wifi_password: '',
        technology: '',
        mac_address: '',
        comment: '',
        newModel: 1,
        sendToMikrotik: true
      },
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
      ]
    }
  },
  mounted () {
    if (this.$route.query.city) {
      this.Client.city = parseInt(this.$route.query.city)
    }
  },
  methods: {
    createClient () {
      this.isSubmitting = !this.isSubmitting
      this.$apollo.mutate({
        mutation: gql`mutation ($input: ClientInput){
          createClient(input: $input){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          input: this.Client
        }
      }).then((input) => {
        if (input.data.createClient.success) {
          this.$router.push({ path: '/lista?city=' + parseInt(this.$route.query.city), query: { created: true } }, () => { window.location.reload(true) }, () => { window.location.reload(true) })
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.createClient.errors[0].message
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
    }
  }
}
</script>

<style>

</style>
