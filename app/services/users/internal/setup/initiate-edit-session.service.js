/**
 * Initiates the session record used for editing an internal user account
 * @module InitiateEditSessionService
 */

import CreateSessionDal from '../../../../dal/create-session.dal.js'
import FetchUserDetailsDal from '../../../../dal/users/internal/fetch-user-details.dal.js'
import { userPermissions } from '../../../../lib/static-lookups.lib.js'

/**
 * Initiates the session record used for editing an internal user account
 *
 * @param {string} id - the UUID of the internal user
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
export default async function go(id) {
  const user = await FetchUserDetailsDal(id)

  const data = _formatDataForJourney(user)

  return CreateSessionDal(data)
}

/**
 * The data needs to be formatted to fit into the existing journey.
 *
 * Simple structure changes and renaming.
 *
 * The user object is also added to the session data. This will be needed to update the user record.
 *
 * When the 'user' object is present, then we know this is the edit journey.
 *
 * @private
 */
function _formatDataForJourney(user) {
  const { groups, roles, username } = user

  const group = groups.length > 0 ? groups[0].group : null
  const role = roles.length > 0 ? roles[0].role : null

  const permission = _getUserPermissionKey(group, role)

  user.currentPermission = permission
  user.currentStatus = user.$status()

  return {
    access: user.enabled ? 'enabled' : 'disabled',
    email: username,
    permission,
    user
  }
}

function _getUserPermissionKey(group, role) {
  const matchingPermission = Object.values(userPermissions).find((permission) => {
    return (
      (permission.application === 'water_admin' || permission.application === 'both') &&
      (group ? permission.groups.includes(group) : permission.groups.length === 0) &&
      (role ? permission.roles.includes(role) : permission.roles.length === 0)
    )
  })

  return matchingPermission.key
}
