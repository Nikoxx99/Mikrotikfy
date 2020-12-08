export default function ({ route, redirect }) {
  if (!route.query.city) {
    const path = route.path
    return redirect(path + '?city=5f832e8fb0c43e2c64b37437')
  }
}
