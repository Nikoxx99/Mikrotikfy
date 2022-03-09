<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          :block="block"
          :text="!block"
          :x-small="!block"
          :color="$vuetify.theme.dark && !block ? 'white' : 'primary'"
          v-on="on"
          @click="initComponent"
        >
          <v-icon>mdi-newspaper-variant-outline</v-icon>
          <span v-if="block">
            Ficha Técnica
          </span>
        </v-btn>
      </template>
      <span>Ficha Técnica</span>
    </v-tooltip>
    <v-dialog
      v-model="dialog"
      width="680px"
    >
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-btn
            icon
            dark
            @click="dialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Settings</v-toolbar-title>
        </v-toolbar>
        <v-stepper
          v-model="e6"
          vertical
        >
          <v-stepper-step
            :complete="e6 > 1"
            step="1"
          >
            Calidad de señal
            <small>En que condiciones quedo el servicio</small>
          </v-stepper-step>

          <v-stepper-content step="1">
            <v-select
              :items="quality"
              label="Calidad de señal"
              prepend-icon="mdi-signal"
              class="mb-5"
              outlined
              hide-details
            />
            <v-btn
              color="primary"
              @click="e6 = 2"
            >
              Siguiente
            </v-btn>
            <v-btn text>
              Cancel
            </v-btn>
          </v-stepper-content>
        </v-stepper>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
export default {
  data () {
    return {
      e6: 1,
      dialog: true,
      quality: [
        'Excelente',
        'Regular',
        'Mala'
      ]
    }
  },
  methods: {
    initComponent () {
      this.dialog = true
    }
  }
}
</script>
