export default ({ store }, inject) => {
  inject('isAdmin', (_) => {
    return store.state.role.name === 'superadmin' || store.state.role.name === 'admin'
  })
  inject('isBiller', (_) => {
    return store.state.role.name === 'biller'
  })
  inject('isTechnician', (_) => {
    return store.state.role.name === 'technician'
  })
}
