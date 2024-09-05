'use strict'

const { data: groups } = require('./groups.js')
const { data: users } = require('./users.js')

const data = [
  {
    id: '950706f1-31f7-4af6-aba0-40bfd00a06e0',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    userId: users.find((user) => { return user.username === 'admin-internal@wrls.gov.uk' }).id
  },
  {
    id: '9d2aa1e8-6f36-491d-9e7f-5536b3100d4d',
    groupId: groups.find((group) => { return group.group === 'super' }).id,
    userId: users.find((user) => { return user.username === 'super.user@wrls.gov.uk' }).id
  },
  {
    id: '9d9a7b55-4a31-4561-a556-f71cd367becb',
    groupId: groups.find((group) => { return group.group === 'environment_officer' }).id,
    userId: users.find((user) => { return user.username === 'environment.officer@wrls.gov.uk' }).id
  },
  {
    id: 'b90c6892-6113-4a84-b5a4-fffafba26ae5',
    groupId: groups.find((group) => { return group.group === 'wirs' }).id,
    userId: users.find((user) => { return user.username === 'waste.industry.regulatory.services@wrls.gov.uk' }).id
  },
  {
    id: '9d8fd2df-f5da-4450-8151-95f2c68c0232',
    groupId: groups.find((group) => { return group.group === 'billing_and_data' }).id,
    userId: users.find((user) => { return user.username === 'billing.data@wrls.gov.uk' }).id
  },
  {
    id: 'c5d7cbe2-591c-4a77-a3da-1a2acf5cdbd3',
    groupId: groups.find((group) => { return group.group === 'psc' }).id,
    userId: users.find((user) => { return user.username === 'permitting.support.centre@wrls.gov.uk' }).id
  },
  {
    id: 'da306f92-87e6-48f8-a521-411b19c0693f',
    groupId: groups.find((group) => { return group.group === 'nps' }).id,
    userId: users.find((user) => { return user.username === 'national.permitting.service@wrls.gov.uk' }).id
  }
]

module.exports = {
  data
}
