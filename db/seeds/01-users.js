'use strict'

const bcrypt = require('bcryptjs')

const { generateUUID } = require('../../app/lib/general.lib.js')

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
  // The following applies to all the seed users listed above.
  //
  // First create the user record if it doesn't exist
  await _insertUsersWhereNotExists(knex)

  // Then if the seed user has a group property check if a `user_group` record exists. (This is only expected to be the
  // case if we have just created the user)
  await _updateSeedUsersWithUserIdAndGroupId(knex)

  // Finally, if the seed user has a group property and we've not found a `user_group` record, insert one. It's this
  // that gives, for example, the billing.data@wrls.gov.uk user the permissions it needs to access billing features
  await _insertUserGroupsWhereNotExists(knex)
}

function _generateHashedPassword () {
  // 10 is the number of salt rounds to perform to generate the salt. The legacy code uses
  // const salt = bcrypt.genSaltSync(10) to pre-generate the salt before passing it to hashSync(). But this is
  // intended for operations where you need to hash a large number of values. If you just pass in a number bcrypt will
  // autogenerate the salt for you.
  // https://github.com/kelektiv/node.bcrypt.js#usage
  return bcrypt.hashSync(DatabaseConfig.defaultUserPassword, 10)
}

async function _groups (knex) {
  return knex('groups')
    .withSchema('idm')
    .select('groupId', 'group')
}

async function _insertUsersWhereNotExists (knex) {
  const password = _generateHashedPassword()

  for (const seedUser of seedUsers) {
    const existingUser = await knex('users')
      .withSchema('idm')
      .first('userId')
      .where('userName', seedUser.userName)
      .andWhere('application', seedUser.application)

    if (!existingUser) {
      await knex('users')
        .withSchema('idm')
        .insert({
          userName: seedUser.userName,
          application: seedUser.application,
          password,
          userData: '{ "source": "Seeded" }',
          resetRequired: 0,
          badLogins: 0
        })
    }
  }
}

async function _insertUserGroupsWhereNotExists (knex) {
  const seedUsersWithGroups = seedUsers.filter((seedData) => {
    return seedData.group
  })

  for (const seedUser of seedUsersWithGroups) {
    const existingUserGroup = await knex('userGroups')
      .withSchema('idm')
      .first('userGroupId')
      .where('userId', seedUser.userId)
      .andWhere('groupId', seedUser.groupId)

    if (!existingUserGroup) {
      await knex('idm.userGroups')
        .insert({
          userGroupId: generateUUID(),
          userId: seedUser.userId,
          groupId: seedUser.groupId
        })
    }
  }
}

async function _updateSeedUsersWithUserIdAndGroupId (knex) {
  const users = await _users(knex)
  const groups = await _groups(knex)

  seedUsers.forEach((seedUser) => {
    const user = users.find(({ userName }) => {
      return userName === seedUser.userName
    })
    seedUser.userId = user.userId

    if (seedUser.group) {
      const userGroup = groups.find(({ group }) => {
        return group === seedUser.group
      })
      seedUser.groupId = userGroup.groupId
    }
  })
}

async function _users (knex) {
  return knex('users')
    .withSchema('idm')
    .select('userId', 'userName')
}

module.exports = {
  seed
}
