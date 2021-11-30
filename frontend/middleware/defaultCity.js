export default function ({ route, redirect }) {
  if (route.path === '/lista') {
    return redirect('/clients')
  }
  if (!route.query.city) {
    if (route.path === '/') {
      return redirect('/clients?city=5f832e8fb0c43e2c64b37437')
    } else if (route.path === '/lista?city=5f832e8fb0c43e2c64b37437' || route.path === '/clients?city=5fc3f0408e3de73d204cd430') {
      return redirect('/clients')
    }
    const path = route.path
    return redirect(path + '?city=5f832e8fb0c43e2c64b37437')
  }
}
