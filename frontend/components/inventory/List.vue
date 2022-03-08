<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title>
          Inventario General
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="inventory"
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
    { text: 'Cantidad Disponible', value: 'code', sortable: false },
    { text: 'Fecha de Adición', value: 'code', sortable: false },
    { text: 'Fecha ultimo movimiento', value: 'code', sortable: false }
  ]
}
</script>
