'use strict'

/**
 * Creates a new user
 * @module CreateUserDal
 */

const { hashSync } = require('bcryptjs')

const EventModel = require('../../../models/event.model.js')
const FetchUserDetailsDal = require('./fetch-user-details.dal.js')
const GroupModel = require('../../../models/group.model.js')
const NotificationModel = require('../../../models/notification.model.js')
const RoleModel = require('../../../models/role.model.js')
const UserModel = require('../../../models/user.model.js')
const { generateUUID, timestampForPostgres } = require('../../../lib/general.lib.js')
const { domains } = require('../../../../config/server.config.js')
const { userPermissions } = require('../../../lib/static-lookups.lib.js')

/**
 * Creates a new user
 *
 * @param {object} auth - The current user's authentication details from `request.auth`
 * @param {object} session - The session instance
 *
 * @returns {Promise<object>} The created notification
 */
async function go(auth, session) {
  const { email, permission } = session
  const { application, groups, roles } = userPermissions[permission]

  // We do this because a "Basic access" user can be both internal and external, so we set it to be internal here
  const resolvedApplication = application === 'both' ? 'water_admin' : application

  const groupIds = await GroupModel.query().select('id').whereIn('group', groups)
  const roleIds = await RoleModel.query().select('id').whereIn('role', roles)

  return UserModel.transaction(async (trx) => {
    const { id, resetGuid, userId } = await _insertUser(resolvedApplication, email, trx)

    if (groupIds.length > 0) {
      await _insertUserGroups(groupIds, id, trx)
    }

    if (roleIds.length > 0) {
      await _insertUserRoles(roleIds, id, trx)
    }

    await _insertEvent(auth, email, trx, userId)

    const notification = await _insertNotification(email, resetGuid, trx)

    return notification
  })
}

async function _insertEvent(auth, email, trx, userId) {
  const { username } = await FetchUserDetailsDal.go(auth.credentials.user.id)

  const eventData = {
    createdAt: timestampForPostgres(),
    entities: [],
    issuer: username,
    licences: [],
    metadata: { user: email, userId },
    subtype: 'internal',
    type: 'new-user',
    updatedAt: timestampForPostgres()
  }

  return EventModel.query(trx).insert(eventData)
}

async function _insertNotification(email, resetGuid, trx) {
  const personalisation = {
    unique_create_password_link: `${domains.internal}/reset_password_change_password?resetGuid=${resetGuid}`
  }

  const notificationData = {
    messageRef: 'new_internal_user_email',
    messageType: 'email',
    personalisation,
    recipient: email
  }

  return NotificationModel.query(trx).insert(notificationData)
}

async function _insertUser(application, email, trx) {
  const userData = {
    application,
    badLogins: 0,
    password: hashSync(generateUUID(), 10), // Sets a random password
    resetGuid: generateUUID(),
    resetGuidCreatedAt: timestampForPostgres(),
    resetRequired: 1,
    username: email
  }

  return UserModel.query(trx).insert(userData).returning('id', 'resetGuid', 'userId')
}

async function _insertUserGroups(groupIds, id, trx) {
  for (const { id: groupId } of groupIds) {
    await UserModel.relatedQuery('userGroups', trx).for(id).insert({ id: generateUUID(), groupId })
  }
}

async function _insertUserRoles(roleIds, id, trx) {
  for (const { id: roleId } of roleIds) {
    await UserModel.relatedQuery('userRoles', trx).for(id).insert({ id: generateUUID(), roleId })
  }
}

module.exports = {
  go
}
