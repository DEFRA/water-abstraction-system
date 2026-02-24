'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const GroupHelper = require('../../../support/helpers/group.helper.js')
const RoleHelper = require('../../../support/helpers/role.helper.js')

// Thing under test
const FetchPermissionsDetailsService = require('../../../../app/services/users/internal/fetch-permissions-details.service.js')

describe('Users - Internal - Fetch Permissions Details service', () => {
  const seededGroupIds = GroupHelper.data.reduce((groupIds, { id, group }) => {
    groupIds[group] = id
    return groupIds
  }, {})

  const seededRoleIds = RoleHelper.data.reduce((roleIds, { id, role }) => {
    roleIds[role] = id
    return roleIds
  }, {})

  describe('when called', () => {
    let permissions

    beforeEach(() => {
      permissions = 'nps_ar_approver'
    })

    it('returns the correct group and role IDs', async () => {
      const result = await FetchPermissionsDetailsService.go(permissions)

      expect(result).to.equal({
        application: 'water_admin',
        groups: [
          {
            group: 'nps',
            id: seededGroupIds.nps
          }
        ],
        key: 'nps_ar_approver',
        label: 'National Permitting Service and Digitise! approver',
        roles: [
          {
            id: seededRoleIds.ar_approver,
            role: 'ar_approver'
          }
        ]
      })
    })

    describe('for a permission that has no groups or roles', () => {
      beforeEach(() => {
        permissions = 'basic'
      })

      it('returns empty group and role arrays', async () => {
        const result = await FetchPermissionsDetailsService.go(permissions)

        expect(result).to.equal({
          application: 'both',
          groups: [],
          key: 'basic',
          label: 'Basic access',
          roles: []
        })
      })
    })

    describe('for a permission that represents external permissions', () => {
      beforeEach(() => {
        permissions = 'admin'
      })

      it('returns empty group and role arrays', async () => {
        const result = await FetchPermissionsDetailsService.go(permissions)

        expect(result).to.equal({
          application: 'water_vml',
          groups: [],
          key: 'admin',
          label: 'Admin',
          roles: []
        })
      })
    })
  })
})
