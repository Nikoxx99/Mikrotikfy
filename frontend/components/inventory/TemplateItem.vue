<template>
  <div>
    <v-row>
      <v-col cols="8" class="py-1">
        <v-select
          v-model="materialComputed"
          label="Material"
          item-text="name"
          item-value="id"
          return-object
          :items="materiallist"
          outlined
          dense
          hide-details
        />
      </v-col>
      <v-col cols="4" class="py-1">
        <v-text-field
          v-model.number="material.quantity"
          min="1"
          label="Cantidad"
          type="number"
          outlined
          dense
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'InventoryWithdrawTemplateItem',
  props: {
    material: {
      type: Object,
      required: true
    },
    materials: {
      type: Array,
      required: true
    },
    materiallist: {
      type: Array,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data () {
    return {}
  },
  computed: {
    materialComputed: {
      get () {
        return this.material
      },
      set (material, index = this.index) {
        this.$emit('update', { index, material })
      }
    }
  }
}
</script>
