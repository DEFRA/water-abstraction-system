'use strict'

const { data: roles } = require('./roles.js')
const { data: users } = require('./users.js')

const data = [
  {
    id: '90c9a1e2-90b2-43ab-8997-102a535b2f99',
    roleId: roles.find((role) => {
      return role.role === 'ar_user'
    }).id,
    userId: users.find((user) => {
      return user.username === 'digitise.editor@wrls.gov.uk'
    }).id
  },
  {
    id: '9d2aa1e8-6f36-491d-9e7f-5536b3100d4d',
    roleId: roles.find((role) => {
      return role.role === 'ar_approver'
    }).id,
    userId: users.find((user) => {
      return user.username === 'digitise.approver@wrls.gov.uk'
    }).id
  }
]

module.exports = {
  data
}
