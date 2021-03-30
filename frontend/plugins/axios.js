export default function ({ $axios, store }) {
  $axios.onRequest((config) => {
    // eslint-disable-next-line dot-notation
    config.headers.common['Authorization'] = `Bearer ${store.state.auth.accessToken}`
  })
}
