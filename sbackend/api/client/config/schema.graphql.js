module.exports = {
  definition: `
    type ClientStatus {
      status: Boolean
      address: String
      mikrotik: Boolean
      mac_address: String
      offlineTime: String
      disconnectReason: String
      lastCallerId: String
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
      active: Boolean
    }
    type ClientComment {
      comment: String
    }
    type dxResponse {
      code: String
      name: String
      success: Boolean
    }
    input DxClientInput {
      code: String
      name: String
      plan: planDxInput
    }
    input DxInfoInput {
      dx: DxClientInput
      dxPlan: planDxInput
      dxKick: Int
      dxCity: String
    }
    input planDxInput {
      id: String
      name: String
    }
    input adminCreateInput {
      id: String
      code: String
      name: String
      dni: String
      address: String
      neighborhood: String
      city: String
      phone: String
      plan: String
      wifi_ssid: String
      wifi_password: String
      technology: String
      mac_address: String
      operator: String
      comment: String
    }
    input adminDeleteInput {
      id: String
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
    dxClient(input: DxInfoInput): [dxResponse]
    adminCreate(input: adminCreateInput): Boolean
    adminDelete(input: adminDeleteInput): Boolean
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
      },
      dxClient: {
        description: 'dx client processor',
        resolver: 'application::client.client.dxClient',
      },
      adminCreate: {
        description: 'Create client on admin approvation',
        resolver: 'application::client.client.adminCreate',
      },
      adminDelete: {
        description: 'Delete client on admin unapprovation',
        resolver: 'application::client.client.adminDelete',
      }
    }
  },
};