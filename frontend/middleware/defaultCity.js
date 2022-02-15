export default function ({ route, redirect }) {
  if (route.path === '/lista') {
    return redirect('/clients')
  }
  if (!route.query.city) {
    if (route.path === '/') {
      return redirect('/clients?city=MARIQUITA')
    } else if (route.path === '/clients?city=MARIQUITA' || route.path === '/clients?city=FRESNO') {
      return redirect('/clients')
    }
    const path = route.path
    return redirect(path + '?city=MARIQUITA')
  }
}
