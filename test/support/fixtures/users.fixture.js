'use strict'

const GroupHelper = require('../helpers/group.helper.js')
const GroupModel = require('../../../app/models/group.model.js')
const GroupRoleHelper = require('../helpers/group-role.helper.js')
const LicenceEntityModel = require('../../../app/models/licence-entity.model.js')
const LicenceEntityRoleModel = require('../../../app/models/licence-entity-role.model.js')
const RoleHelper = require('../helpers/role.helper.js')
const RoleModel = require('../../../app/models/role.model.js')
const UserHelper = require('../helpers/user.helper.js')
const UserModel = require('../../../app/models/user.model.js')
const UserGroupHelper = require('../helpers/user-group.helper.js')
const UserRoleHelper = require('../helpers/user-role.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

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
 * @param {string|null} [role=null] - If set, the fixture will generate a `LicenceEntity` with a `LicenceEntityRole`
 * record for the specified role and assign it to the returned user. If not set, no `LicenceEntity` will be generated
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function external(role = null) {
  const userData = user(7)

  if (role) {
    userData.licenceEntity = _licenceEntityAndRole(userData.username, role)
  }

  return userData
}

/**
 * Populates a `UserModel` instance as the 'jon.lee@example.co.uk' user for testing purposes
 *
 * @param {string|null} [role=null] - If set, the fixture will generate a `LicenceEntity` with a `LicenceEntityRole`
 * record for the specified role and assign it to the returned user. If not set, no `LicenceEntity` will be generated
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function jonLee(role = null) {
  const userData = user(8)

  if (role) {
    userData.licenceEntity = _licenceEntityAndRole(userData.username, role)
  }

  return userData
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
 * @param {string|null} [role=null] - If set, the fixture will generate a `LicenceEntity` with a `LicenceEntityRole`
 * record for the specified role and assign it to the returned user. If not set, no `LicenceEntity` will be generated
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function rachelStevens(role = null) {
  const userData = user(9)

  if (role) {
    userData.licenceEntity = _licenceEntityAndRole(userData.username, role)
  }

  return userData
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
 * @param {string|null} [role=null] - If set, the fixture will generate a `LicenceEntity` with a `LicenceEntityRole`
 * record for the specified role and assign it to the returned user. If not set, no `LicenceEntity` will be generated
 *
 * @returns {module:UserModel} the populated `UserModel` instance
 */
function tinaBarrett(role = null) {
  const userData = user(13)

  if (role) {
    userData.licenceEntity = _licenceEntityAndRole(userData.username, role)
  }

  return userData
}

/**
 * Transforms a user fixture object previously generated to the `FetchUserInternalService` result format
 *
 * The fixture object will have the groups and user roles relevant to it already populated. But the fetch result also
 * includes all roles for the given group.
 *
 * We use this function to identify the relevant roles for the user's group, extract them from our seed data and assign
 * them to the user object passed in.
 *
 * @param {object} user - The user fixture object to transform to `FetchUserInternalService` result format
 */
function transformToFetchUserInternalResult(user) {
  const groupRoles = GroupRoleHelper.data.filter((groupRole) => {
    return groupRole.groupId === user.groups[0].id
  })

  const seededRoles = RoleHelper.data

  // From those determine which roles should be attached to the user. Be aware, these are distinct from 'user roles'
  // which is why we have picked the Digitise Approver for this test, as it has both group and user roles.
  const roles = groupRoles.map((groupRole) => {
    const matchingRole = seededRoles.find((seededRole) => {
      return seededRole.id === groupRole.roleId
    })

    return {
      description: matchingRole.description,
      id: matchingRole.id,
      role: matchingRole.role
    }
  })

  // Sort the roles to into alphabetical order
  roles.sort((a, b) => {
    return a.role.localeCompare(b.role)
  })

  user.groups[0].roles = roles
}

/**
 * Transforms a user fixture object previously generated to the `FetchUsersService` result format
 *
 * @param {object} user - The user fixture object to transform to `FetchUsersService` result format
 *
 * @returns {module:UserModel} The transformed user fixture object
 */
function transformToFetchUsersResult(user) {
  const {
    application,
    enabled,
    id,
    groups = [],
    lastLogin,
    licenceEntity = null,
    licenceEntityId = null,
    password,
    roles = [],
    userId,
    username
  } = user

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
    licenceEntity: _transformLicenceEntity(licenceEntity),
    licenceEntityId,
    roles: roles.map((role) => {
      return RoleModel.fromJson({
        id: role.id,
        role: role.role
      })
    }),
    statusPassword: password === 'VOID' ? 'VOID' : null,
    userId,
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

  user.groups = _groups(user.userId)
  user.roles = _roles(user.userId)

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

function _licenceEntityAndRole(username, role) {
  const entity = LicenceEntityModel.fromJson({
    id: generateUUID(),
    licenceEntityRoles: [],
    name: username,
    type: 'individual'
  })

  if (role === 'none') {
    return entity
  }

  let entityRole = LicenceEntityRoleModel.fromJson({
    id: generateUUID(),
    licenceEntityId: entity.id,
    role: 'user'
  })
  entity.licenceEntityRoles.push(entityRole)

  if (role === 'user') {
    return entity
  }

  entityRole = LicenceEntityRoleModel.fromJson({
    id: generateUUID(),
    licenceEntityId: entity.id,
    role: 'user_returns'
  })
  entity.licenceEntityRoles.push(entityRole)

  if (role === 'user_returns') {
    return entity
  }

  entityRole = LicenceEntityRoleModel.fromJson({
    id: generateUUID(),
    licenceEntityId: entity.id,
    role: 'primary_user'
  })
  entity.licenceEntityRoles.push(entityRole)

  return entity
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

function _transformLicenceEntity(licenceEntity) {
  if (!licenceEntity) {
    return null
  }

  const { licenceEntityRoles } = licenceEntity

  return LicenceEntityModel.fromJson({
    id: licenceEntity.id,
    licenceEntityRoles: licenceEntityRoles.map((licenceEntityRole) => {
      return LicenceEntityRoleModel.fromJson({
        id: licenceEntityRole.id,
        role: licenceEntityRole.role
      })
    })
  })
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
  transformToFetchUserInternalResult,
  transformToFetchUsersResult,
  user,
  wasteIndustryRegulatoryServices
}
