<template>
  <v-container>
    <v-card class="rounded-xl">
      <v-card-title class="text-center d-flex align-center justify-center">
        Inventario de materiales
      </v-card-title>
      <v-card-text class="d-flex justify-center">
        <v-tabs
          v-model="tab"
          fixed-tabs
          align-with-title
        >
          <v-tabs-slider color="yellow"></v-tabs-slider>

          <v-tab
            v-for="item in items"
            :key="item"
          >
            {{ item }}
          </v-tab>
        </v-tabs>
      </v-card-text>
      <v-card-text>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <InventoryDaily />
          </v-tab-item>
          <v-tab-item>
            <InventoryAdd />
          </v-tab-item>
          <v-tab-item>
            <InventoryList />
          </v-tab-item>
          <v-tab-item>
            <InventoryHistory />
          </v-tab-item>
        </v-tabs-items>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
export default {
  data () {
    return {
      tab: null,
      items: [
        'Diario', 'Ingresar', 'Inventario', 'Historial'
      ],
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    }
  },
  methods: {
  },
  head () {
    return {
      title: 'Inventario - API ARNOP'
    }
  }
}
</script>
