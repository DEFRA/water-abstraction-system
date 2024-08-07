'use strict'

const bcrypt = require('bcryptjs')

const { timestampForPostgres } = require('../../app/lib/general.lib.js')
const Users = require('./data/users.js')
const UserModel = require('../../app/models/user.model.js')

const DatabaseConfig = require('../../config/database.config.js')
const ServerConfig = require('../../config/server.config.js')

async function seed () {
  // These users are for use in our non-production environments only
  if (ServerConfig.environment === 'production') {
    return
  }

  const password = _generateHashedPassword()

  for (const user of Users.data) {
    await _upsert(user, password)
  }
}

function _generateHashedPassword () {
  // 10 is the number of salt rounds to perform to generate the salt. The legacy code uses
  // const salt = bcrypt.genSaltSync(10) to pre-generate the salt before passing it to hashSync(). But this is
  // intended for operations where you need to hash a large number of values. If you just pass in a number bcrypt will
  // autogenerate the salt for you.
  // https://github.com/kelektiv/node.bcrypt.js#usage
  return bcrypt.hashSync(DatabaseConfig.defaultUserPassword, 10)
}

async function _upsert (user, password) {
  return UserModel.query()
    .insert({ ...user, password, updatedAt: timestampForPostgres() })
    .onConflict(['application', 'username'])
    .merge([
      'badLogins',
      'enabled',
      'lastLogin',
      'password',
      'resetGuid',
      'resetGuidCreatedAt',
      'resetRequired',
      'updatedAt'
    ])
}

module.exports = {
  seed
}
