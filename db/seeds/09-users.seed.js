'use strict'

const bcrypt = require('bcryptjs')

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const { data: users } = require('./data/users.js')
const UserModel = require('../../app/models/user.model.js')

const DatabaseConfig = require('../../config/database.config.js')
const ServerConfig = require('../../config/server.config.js')

async function seed() {
  // These users are for use in our non-production environments only
  if (ServerConfig.environment === 'production') {
    return
  }

  const password = _generateHashedPassword()

  for (const user of users) {
    const exists = await _exists(user)

    if (exists) {
      await _update(user, password)
    } else {
      await _insert(user, password)
    }
  }
}

async function _exists(user) {
  const { application, username } = user

  const result = await UserModel.query()
    .select('id')
    .where('application', application)
    .andWhere('username', username)
    .limit(1)
    .first()

  return !!result
}

function _generateHashedPassword() {
  // 10 is the number of salt rounds to perform to generate the salt. The legacy code uses
  // const salt = bcrypt.genSaltSync(10) to pre-generate the salt before passing it to hashSync(). But this is
  // intended for operations where you need to hash a large number of values. If you just pass in a number bcrypt will
  // autogenerate the salt for you.
  // https://github.com/kelektiv/node.bcrypt.js#usage
  return bcrypt.hashSync(DatabaseConfig.defaultUserPassword, 10)
}

async function _idInUse(id) {
  const result = await UserModel.query().findById(id)

  return !!result
}

async function _insert(user, password) {
  const { application, badLogins, enabled, id, lastLogin, resetGuid, resetGuidCreatedAt, resetRequired, username } =
    user

  // NOTE: Seeding users is a pain (!) because of the previous teams choice to use a custom sequence for the ID instead
  // of sticking with UUIDs. This means it is possible that, for example, a user with
  //
  // `username = 'admin-internal@wrls.gov.uk' && application = 'water_admin'`
  //
  // does not exist. _But_ a user with ID 100000 does! So, we do want to insert our record, but we can't use the ID
  // because it is already in use. We only really face this problem when running the seed in our AWS environments.
  const idInUse = await _idInUse(id)

  if (idInUse) {
    return UserModel.query().insert({
      application,
      badLogins,
      enabled,
      lastLogin,
      password,
      resetGuid,
      resetGuidCreatedAt,
      resetRequired,
      username
    })
  }

  return UserModel.query().insert({ ...user, password })
}

async function _update(user, password) {
  const { application, badLogins, enabled, lastLogin, resetGuid, resetGuidCreatedAt, resetRequired, username } = user

  return UserModel.query()
    .patch({
      badLogins,
      enabled,
      lastLogin,
      password,
      resetGuid,
      resetGuidCreatedAt,
      resetRequired,
      updatedAt: timestampForPostgres()
    })
    .where('application', application)
    .andWhere('username', username)
}

module.exports = {
  seed
}
