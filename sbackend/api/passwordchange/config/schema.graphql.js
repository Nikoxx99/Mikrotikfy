module.exports = {
  definition: `
    type ClosedObject {
      name: String
      value: Boolean
    }
    input PasswordChangeInput {
      dni: String
      old_password: String
      closed: ClosedObjectInput
      new_password: String
      address: String
      created_at: String
    }
    input UpdatePasswordChangeInput {
      _id: ID
      closed: ClosedObjectInput
      password: String
      clientid: ID
    }
    input ClosedObjectInput {
      name: String
      value: Boolean
    }
  `,
  query: `
    TestPasswordChange(dni: String): Boolean
  `,
  mutation: `
    createPasswordChangeRequest(input: PasswordChangeInput): Boolean
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
        resolver: 'application::passwordchange.passwordchange.TestPasswordChange'
      },
    },
    Mutation: {
      updatePasswordChangeRequest: {
        description: 'Update passsword change request state',
        resolver: 'application::passwordchange.passwordchange.updatePasswordChangeRequest'
      },
      createPasswordChangeRequest: {
        description: 'Update passsword change request state',
        resolver: 'application::passwordchange.passwordchange.createPasswordChangeRequest'
      },
    }
  },
};