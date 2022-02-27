export const state = () => ({
  telegramBots: []
})
export const mutations = {
  getTelegramBotsFromDatabase (state, telegramBots) {
    try {
      state.telegramBots = telegramBots
    } catch (error) {
      throw new Error(`TELEGRAM BOT MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getTelegramBotsFromDatabase ({ commit }, { token }) {
    try {
      const qs = require('qs')
      const query = qs.stringify({
        populate: ['city']
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}telegrambots?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then((telegramBots) => {
          telegramBots = telegramBots.data.map((telegramBot) => {
            telegramBot.attributes.city.data.attributes.id = telegramBot.attributes.city.data.id
            telegramBot.attributes.city = telegramBot.attributes.city.data.attributes
            telegramBot.attributes.id = telegramBot.id
            return telegramBot.attributes
          })
          localStorage.setItem('telegramBots', JSON.stringify(telegramBots))
          commit('getTelegramBotsFromDatabase', telegramBots)
        })
    } catch (error) {
      throw new Error(`TELEGRAM BOT ACTION ${error}`)
    }
  }
}
