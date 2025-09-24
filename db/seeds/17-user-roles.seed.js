'use strict'

const { db } = require('../db.js')
const { data: roles } = require('./data/roles.js')
const UserRoleModel = require('../../app/models/user-role.model.js')
const { data: userRoles } = require('./data/user-roles.js')
const { data: users } = require('./data/users.js')

const ServerConfig = require('../../config/server.config.js')

async function seed() {
  // These user groups relate to users that are only for use in our non-production environments
  if (ServerConfig.environment === 'production') {
    return
  }

  for (const userRole of userRoles) {
    const { role, username } = _names(userRole)

    const exists = await _exists(role, username)

    if (!exists) {
      await _insert(userRole.id, role, username)
    }
  }
}

async function _exists(role, username) {
  const result = await UserRoleModel.query()
    .select('userRoles.id')
    .innerJoinRelated('role')
    .innerJoinRelated('user')
    .where('role.role', role)
    .andWhere('user.username', username)
    .limit(1)
    .first()

  return !!result
}

async function _insert(id, role, username) {
  return db.raw(
    `
    INSERT INTO public.user_roles (id, role_id, user_id)
    SELECT
      (?) AS id,
      (SELECT id FROM public.roles r WHERE r.role = ?) AS role_id,
      (SELECT id FROM public.users u WHERE u.username = ?) AS user_id;
    `,
    [id, role, username]
  )
}

function _names(userRole) {
  const { role } = roles.find((role) => {
    return role.id === userRole.roleId
  })

  const { username } = users.find((user) => {
    return user.id === userRole.userId
  })

  return { role, username }
}

module.exports = {
  seed
}
