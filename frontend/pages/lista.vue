<template>
  <div>
    <Tickets />
    <ClientList />
  </div>
</template>

<script>
import ClientList from '../components/main/ClientList'
import Tickets from '../components/main/Tickets'
export default {
  components: {
    ClientList,
    Tickets
  },
  data () {
    return {
    }
  }
}
</script>
