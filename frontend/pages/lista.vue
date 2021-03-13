<template>
  <div>
    <ActivationRequestList />
    <Tickets />
    <ClientList />
  </div>
</template>

<script>
import ClientList from '../components/main/ClientList'
import Tickets from '../components/main/Tickets'
import ActivationRequestList from '../components/main/ActivationRequestList'
export default {
  components: {
    ClientList,
    Tickets,
    ActivationRequestList
  },
  data () {
    return {
    }
  }
}
</script>
