<template>
  <div>
    <h1>Camera MAC - Lector de codigo de barras</h1>
    <v-btn @click="initCamera()">
      {{ initialized ? 'Stop' : tries >= 1 ? 'Retry' : 'Start' }}
    </v-btn>
    <div id="camera_stream" />
    <div>
      {{ mac_result }}
    </div>
  </div>
</template>
<script>
import Quagga from 'quagga'
export default {
  data () {
    return {
      mac_result: '0',
      initialized: false,
      tries: 0
    }
  },
  methods: {
    initCamera () {
      this.initialized = true
      this.mac_result = '0'
      this.tries++
      Quagga.init({
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: document.querySelector('#camera_stream')
        },
        decoder: {
          readers: ['code_128_reader']
        }
      }, function (err) {
        if (err) {
          console.log(err)
          return
        }
        Quagga.start()
      })
      Quagga.onDetected((e) => {
        Quagga.stop()
        this.initialized = false
        this.mac_result = e.codeResult.code
      })
    }
  }
}
</script>
