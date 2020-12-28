module.exports = {
  definition: `
    type ClosedObject {
      name: String
      value: Boolean
    }
    type PasswordChangeType {
      dni: String
      client: Client
      old_password: String
      new_password: String
      closed: ClosedObject
    }
    input UpdatePasswordChangeInput {
      _id: ID
      closed: ClosedObjectInput
    }
    input ClosedObjectInput {
      name: String
      value: Boolean
    }
  `,
  query: `
    TestPasswordChange(dni: String): PasswordChangeType
    passwordchangesq(dni: String): [PasswordChangeType]
  `,
  mutation: `
    updatePasswordChangeRequest(input: UpdatePasswordChangeInput): Boolean
  `,
  type: {
    TestPasswordChange: {
      name: 'returns old password changes querys'
    }
  },
  resolver: {
    Query: {
      TestPasswordChange: {
        description: 'Return old password changes queries for test',
        resolver: 'application::passwordchange.passwordchange.getTestPasswordChange'
      },
      passwordchangesq: {
        description: 'Return password change request',
        resolver: 'application::passwordchange.passwordchange.PasswordChangeCtrl'
      }
    },
    Mutation: {
      updatePasswordChangeRequest: {
        description: 'Update passsword change request state',
        resolver: 'application::passwordchange.passwordchange.updatePasswordChangeRequest'
      }
    }
  },
};