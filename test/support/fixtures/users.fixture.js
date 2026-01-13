'use strict'

const GroupHelper = require('../support/helpers/group.helper.js')
const GroupModel = require('../../app/models/group.model.js')
const RoleHelper = require('../support/helpers/role.helper.js')
const RoleModel = require('../../app/models/role.model.js')
const UserHelper = require('../support/helpers/user.helper.js')
const UserModel = require('../../app/models/user.model.js')
const UserGroupHelper = require('../support/helpers/user-group.helper.js')
const UserRoleHelper = require('../support/helpers/user-role.helper.js')

/**
 * Populates a `UserModel` instance as the 'admin-internal@wrls.gov.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function adminInternal() {
  return user(0)
}

/**
 * Populates a `UserModel` instance as the 'basic.access@wrls.gov.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function basicAccess() {
  return user(10)
}

/**
 * Populates a `UserModel` instance as the 'billing.and.data@wrls.gov.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function billingAndData() {
  return user(4)
}

/**
 * Populates a `UserModel` instance as the 'digitise.approver@wrls.gov.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function digitiseApprover() {
  return user(12)
}

/**
 * Populates a `UserModel` instance as the 'digitise.editor@wrls.gov.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function digitiseEditor() {
  return user(11)
}

/**
 * Populates a `UserModel` instance as the 'environment.officer@wrls.gov.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function environmentOfficer() {
  return user(2)
}

/**
 * Populates a `UserModel` instance as the 'external@example.co.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function external() {
  return user(7)
}

/**
 * Populates a `UserModel` instance as the 'jon.lee@example.co.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function jonLee() {
  return user(8)
}

/**
 * Populates a `UserModel` instance as the 'national.permitting.service@wrls.gov.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function nationalPermittingService() {
  return user(6)
}

/**
 * Populates a `UserModel` instance as the 'permitting.support.centre@wrls.gov.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function permittingSupportCentre() {
  return user(5)
}

/**
 * Populates a `UserModel` instance as the 'rachel.stevens@example.co.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function rachelStevens() {
  return user(9)
}

/**
 * Populates a `UserModel` instance as the 'super.user@wrls.gov.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function superUser() {
  return user(1)
}

/**
 * Populates a `UserModel` instance as the 'tina.barrett@example.co.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function tinaBarrett() {
  return user(13)
}

/**
 * Transforms a user fixture object previously generated to the `FetchUsersService` result format
 *
 * @param {object} user - The user fixture object to transform to `FetchUsersService` result format
 *
 * @returns {module:UserModel} The transformed user fixture object
 */
function transformToFetchUsersResult(user) {
  const { application, enabled, id, groups, lastLogin, password, roles, username } = user

  return UserModel.fromJson({
    application,
    enabled,
    id,
    groups: groups.map((group) => {
      return GroupModel.fromJson({
        group: group.group,
        id: group.id
      })
    }),
    lastLogin,
    statusPassword: password === 'VOID' ? 'VOID' : null,
    roles: roles.map((role) => {
      return RoleModel.fromJson({
        id: role.id,
        role: role.role
      })
    }),
    username
  })
}

/**
 * Populates a `UserModel` instance based on the specified seed user for testing purposes
 *
 * @param {integer} seedIndex - The index of the user object in `db/seeds/data/users.js`
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function user(seedIndex) {
  const user = UserHelper.select(seedIndex)

  user.groups = _groups(user.id)
  user.roles = _roles(user.id)

  return user
}

/**
 * Populates a `UserModel` instance as the 'waste.industry.regulatory.services@wrls.gov.uk' user for testing purposes
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function wasteIndustryRegulatoryServices() {
  return user(3)
}

function _groups(userId) {
  const userGroups = UserGroupHelper.data.filter((userGroup) => {
    return userGroup.userId === userId
  })

  return userGroups.map((userGroup) => {
    const match = GroupHelper.data.find((group) => {
      return group.id === userGroup.groupId
    })

    return GroupModel.fromJson(match)
  })
}

function _roles(userId) {
  const userRoles = UserRoleHelper.data.filter((userRole) => {
    return userRole.userId === userId
  })

  const roles = []

  for (const userRole of userRoles) {
    const role = RoleHelper.data.find((role) => {
      return role.id === userRole.roleId
    })

    roles.push(RoleModel.fromJson(role))
  }

  return roles
}

module.exports = {
  adminInternal,
  basicAccess,
  billingAndData,
  digitiseApprover,
  digitiseEditor,
  environmentOfficer,
  external,
  jonLee,
  nationalPermittingService,
  permittingSupportCentre,
  rachelStevens,
  superUser,
  tinaBarrett,
  transformToFetchUsersResult,
  user,
  wasteIndustryRegulatoryServices
}
