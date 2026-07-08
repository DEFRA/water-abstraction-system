import { db } from '../db.js'
import { data as roles } from './data/roles.js'
import UserRoleModel from '../../app/models/user-role.model.js'
import { data as userRoles } from './data/user-roles.js'
import { data as users } from './data/users.js'

import ServerConfig from '../../config/server.config.js'

export default async function seed() {
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
      (SELECT user_id FROM public.users u WHERE u.username = ?) AS user_id;
    `,
    [id, role, username]
  )
}

function _names(userRole) {
  const { role } = roles.find((role) => {
    return role.id === userRole.roleId
  })

  const { username } = users.find((user) => {
    return user.userId === userRole.userId
  })

  return { role, username }
}

export {
  seed
}