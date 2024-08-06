'use strict'

const { ForeignKeyViolationError } = require('db-errors')

const GroupRoleModel = require('../../app/models/group-role.model.js')
const GroupRoles = require('./data/group-roles.js')

async function seed () {
  for (const groupRole of GroupRoles.data) {
    await _upsert(groupRole)
  }
}

async function _upsert (groupRole) {
  // NOTE: `group_roles` is simply a many-to-many table that links groups and roles in the IDM schema. It will have
  // been populated when the legacy migrations are run. So, in most environments we would expect either the onConflict
  // to trigger, which we ignore. Else, the role and group IDs we're using don't cause a conflict because they don't
  // match the groups and roles that have already been populated. When this happens a ForeignKeyViolationError will
  // be thrown, which we ignore because again, it means the database is already seeded.
  //
  // When seeding the test DB, or in a blank DB however, the seeding should complete without issue.
  return GroupRoleModel.query()
    .insert(groupRole)
    .onConflict(['groupId', 'roleId'])
    .ignore()
    .onError(async (error, _builder) => {
      if (error instanceof ForeignKeyViolationError) {
        return { error: 'Group or Role ID is unknown most likely due to database already being seeded.' }
      }

      return Promise.reject(error)
    })
}

module.exports = {
  seed
}
