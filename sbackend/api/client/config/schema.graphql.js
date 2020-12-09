module.exports = {
  definition: `
    type ClientStatus {
      status: Boolean
      address: String
      mikrotik: Boolean
      mac_address: String
      offlineTime: String
      uptime: String
      download: String
      upload: String
    }
    type SearchClient {
      _id: ID
      code: String
      name: String
      dni: String
      address: String
      neighborhood: Neighborhood
      city: City
      phone: String
      plan: Plan
      wifi_ssid: String
      wifi_password: String
      technology: Technology
      mac_address: String
      comment: String
      operator: Int
      created_at: String
      newModel: Int
    }
    type ClientComment {
      comment: String
    }
  `,
  query: `
    ClientStatus(id: ID): ClientStatus
    clientCount(city: String): Int
    clientCountActive(city: String): Int
    clientCountDisable(city: String): Int
    searchClient(search: String, limit: Int, city: String): [SearchClient]
    getClientComment(id: ID): ClientComment
  `,
  mutation: `
    editClientPlan(id: String, plan: String): Boolean
  `,
  type: {
    ActiveClientList: {
      name: 'returns the list of all active clients'
    }
  },
  resolver: {
    Query: {
      ClientStatus: {
        description: 'Return the active client status info',
        resolver: 'application::client.client.getClientStatus'
      },
      clientCount: {
        description: 'Return client count',
        resolver: 'application::client.client.count'
      },
      clientCountActive: {
        description: 'Return active client count',
        resolver: 'application::client.client.countActive'
      },
      clientCountDisable: {
        description: 'Return disable client count',
        resolver: 'application::client.client.countDisable'
      },
      searchClient: {
        description: 'Search for a Client',
        resolver: 'application::client.client.searchClient'
      },
      getClientComment: {
        description: 'Gets Client comment',
        resolver: 'application::client.client.getClientComment'
      }
    },
    Mutation: {
      editClientPlan: {
        description: 'Edit client plan',
        resolver: 'application::client.client.editClientPlan',
      }
    }
  },
};