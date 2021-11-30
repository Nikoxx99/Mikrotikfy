<template>
  <div>
    <h1>{{ napdata ? napdata.code : 'no hay' }}</h1>
  </div>
</template>
<script>
export default {
  props: {
    napdata: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
    }
  }
}

</script>
