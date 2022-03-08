<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title>
          Historial de Movimientos
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="inventoryInternet"
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  headers: [
    { text: '#', value: 'code', sortable: false },
    { text: 'Material', value: 'code', sortable: false },
    { text: 'Cantidad', value: 'code', sortable: false },
    { text: 'Entrego', value: 'code', sortable: false },
    { text: 'Operario', value: 'code', sortable: false },
    { text: 'Fecha', value: 'code', sortable: false }
  ]
}
</script>
