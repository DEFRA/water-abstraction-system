'use strict'

const { db } = require('../db.js')
const { data: groups } = require('./data/groups.js')
const UserGroupModel = require('../../app/models/user-group.model.js')
const { data: userGroups } = require('./data/user-groups.js')
const { data: users } = require('./data/users.js')

const ServerConfig = require('../../config/server.config.js')

async function seed () {
  // These user groups relate to users that are only for use in our non-production environments
  if (ServerConfig.environment === 'production') {
    return
  }

  for (const userGroup of userGroups) {
    const { group, username } = _names(userGroup)

    const exists = await _exists(group, username)

    if (!exists) {
      await _insert(userGroup.id, group, username)
    }
  }
}

async function _exists (group, username) {
  const result = await UserGroupModel.query()
    .select('userGroups.id')
    .innerJoinRelated('group')
    .innerJoinRelated('user')
    .where('group.group', group)
    .andWhere('user.username', username)
    .limit(1)
    .first()

  return !!result
}

async function _insert (id, group, username) {
  return db.raw(`
    INSERT INTO public.user_groups (id, group_id, user_id)
    SELECT
      (?) AS id,
      (SELECT id FROM public."groups" g WHERE g."group" = ?) AS group_id,
      (SELECT id FROM public.users u WHERE u.username = ?) AS user_id;
    `, [id, group, username])
}

function _names (userGroup) {
  const { group } = groups.find((group) => {
    return group.id === userGroup.groupId
  })

  const { username } = users.find((user) => {
    return user.id === userGroup.userId
  })

  return { group, username }
}

module.exports = {
  seed
}
