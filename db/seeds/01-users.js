'use strict'

const bcrypt = require('bcryptjs')
const { randomUUID } = require('crypto')

const DatabaseConfig = require('../../config/database.config.js')

const seedUsers = [
  {
    userName: 'admin-internal@wrls.gov.uk',
    application: 'water_admin',
    group: 'super'
  },
  {
    userName: 'super.user@wrls.gov.uk',
    application: 'water_admin',
    group: 'super'
  },
  {
    userName: 'environment.officer@wrls.gov.uk',
    application: 'water_admin',
    group: 'environment_officer'
  },
  {
    userName: 'waster.industry.regulatory.services@wrls.gov.uk',
    application: 'water_admin',
    group: 'wirs'
  },
  {
    userName: 'billing.data@wrls.gov.uk',
    application: 'water_admin',
    group: 'billing_and_data'
  },
  {
    userName: 'permitting.support.centre@wrls.gov.uk',
    application: 'water_admin',
    group: 'psc'
  },
  {
    userName: 'external@example.co.uk',
    application: 'water_vml'
  },
  {
    userName: 'jon.lee@example.co.uk',
    application: 'water_vml'
  },
  {
    userName: 'rachel.stevens@example.co.uk',
    application: 'water_vml'
  }
]

async function seed (knex) {
  await _insertUsersWhereNotExists(knex)

  const users = await _users(knex)
  const groups = await _groups(knex)

  seedUsers.forEach((seedUser) => {
    const user = users.find(({ userName }) => {
      return userName === seedUser.userName
    })
    seedUser.userId = user.userId

    if (seedUser.group) {
      const userGroup = groups.find(({ group }) => group === seedUser.group)
      seedUser.groupId = userGroup.groupId
    }
  })

  await _insertUserGroupsWhereNotExists(knex)
}

async function _insertUsersWhereNotExists (knex) {
  const password = _generateHashedPassword()

  for (const seedUser of seedUsers) {
    await knex('idm.users')
      .select('userId')
      .where('userName', seedUser.userName)
      .andWhere('application', seedUser.application)
      .then(async (results) => {
        if (results.length === 0) {
          await knex('idm.users')
            .insert({
              userName: seedUser.userName,
              application: seedUser.application,
              password,
              userData: '{ "source": "Seeded" }',
              resetRequired: 0,
              badLogins: 0
            })
        }
      })
  }
}

async function _insertUserGroupsWhereNotExists (knex) {
  const seedUsersWithGroups = seedUsers.filter((seedData) => seedData.group)

  for (const seedUser of seedUsersWithGroups) {
    await knex('idm.userGroups')
      .select('userGroupId')
      .where('userId', seedUser.userId)
      .andWhere('groupId', seedUser.groupId)
      .then(async (results) => {
        if (results.length === 0) {
          await knex('idm.userGroups')
            .insert({
              userGroupId: randomUUID({ disableEntropyCache: true }),
              userId: seedUser.userId,
              groupId: seedUser.groupId
            })
        }
      })
  }
}

function _generateHashedPassword () {
  const salt = bcrypt.genSaltSync(10)

  return bcrypt.hashSync(DatabaseConfig.defaultUserPassword, salt)
}

async function _groups (knex) {
  return knex('idm.groups')
    .select('groupId', 'group')
}

async function _users (knex) {
  return knex('idm.users')
    .select('userId', 'userName')
    .whereJsonPath('userData', '$.source', '=', 'Seeded')
}

module.exports.seed = seed
