import { db } from '../db.js'
import GroupRoleModel from '../../app/models/group-role.model.js'
import { data as groupRoles } from './data/group-roles.js'
import { data as groups } from './data/groups.js'
import { data as roles } from './data/roles.js'

export default async function seed() {
  for (const groupRole of groupRoles) {
    const { group, role } = _names(groupRole)

    const exists = await _exists(group, role)

    if (!exists) {
      await _insert(groupRole.id, group, role)
    }
  }
}

async function _exists(group, role) {
  const result = await GroupRoleModel.query()
    .select('groupRoles.id')
    .innerJoinRelated('group')
    .innerJoinRelated('role')
    .where('group.group', group)
    .andWhere('role.role', role)
    .limit(1)
    .first()

  return !!result
}

async function _insert(id, group, role) {
  return db.raw(
    `
    INSERT INTO public.group_roles (id, group_id, role_id)
    SELECT
      (?) AS id,
      (SELECT id FROM public."groups" g WHERE g."group" = ?) AS group_id,
      (SELECT id FROM public.roles r WHERE r.role = ?) AS role_id;
    `,
    [id, group, role]
  )
}

function _names(groupRole) {
  const { group } = groups.find((group) => {
    return group.id === groupRole.groupId
  })

  const { role } = roles.find((role) => {
    return role.id === groupRole.roleId
  })

  return { group, role }
}

export {
  seed
}