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
const FetchAllPermissionsDetailsDal = require('../../../../app/dal/users/internal/fetch-all-permissions-details.dal.js')

describe('DAL - Fetch All Permissions Details', () => {
  let includeSuper

  const seededGroupIds = GroupHelper.data.reduce((groupIds, { id, group }) => {
    groupIds[group] = id
    return groupIds
  }, {})

  const seededRoleIds = RoleHelper.data.reduce((roleIds, { id, role }) => {
    roleIds[role] = id
    return roleIds
  }, {})

  beforeEach(() => {
    includeSuper = false
  })

  describe('when called', () => {
    it('returns all permissions with the correct group and role IDs and descriptions', async () => {
      const result = await FetchAllPermissionsDetailsDal.go(includeSuper)

      expect(result).to.equal({
        admin: {
          application: 'water_vml',
          groups: [],
          key: 'admin',
          label: 'Admin',
          roles: []
        },
        basic: {
          application: 'both',
          groups: [],
          key: 'basic',
          label: 'Basic access',
          roles: []
        },
        billing_and_data: {
          application: 'water_admin',
          groups: [
            {
              description: 'Water Resources Billing & Data',
              group: 'billing_and_data',
              id: seededGroupIds.billing_and_data,
              roles: [
                {
                  description: 'Administer billing',
                  id: seededRoleIds.billing,
                  role: 'billing'
                },
                {
                  description: 'Send bulk return invitations and reminder notifications',
                  id: seededRoleIds.bulk_return_notifications,
                  role: 'bulk_return_notifications'
                },
                {
                  description: 'Create and edit charge information workflow data',
                  id: seededRoleIds.charge_version_workflow_editor,
                  role: 'charge_version_workflow_editor'
                },
                {
                  description: 'Approve charge information workflow data',
                  id: seededRoleIds.charge_version_workflow_reviewer,
                  role: 'charge_version_workflow_reviewer'
                },
                {
                  description: 'Delete licence agreements',
                  id: seededRoleIds.delete_agreements,
                  role: 'delete_agreements'
                },
                {
                  description: 'Create and manage internal user accounts',
                  id: seededRoleIds.manage_accounts,
                  role: 'manage_accounts'
                },
                {
                  description: 'Create and edit licence agreements',
                  id: seededRoleIds.manage_agreements,
                  role: 'manage_agreements'
                },
                {
                  description: 'View invoice accounts and change invoice account address',
                  id: seededRoleIds.manage_billing_accounts,
                  role: 'manage_billing_accounts'
                },
                {
                  description: 'Submit and edit returns',
                  id: seededRoleIds.returns,
                  role: 'returns'
                },
                {
                  description: 'Remove licences registered to a company',
                  id: seededRoleIds.unlink_licences,
                  role: 'unlink_licences'
                },
                {
                  description: 'View charge information',
                  id: seededRoleIds.view_charge_versions,
                  role: 'view_charge_versions'
                }
              ]
            }
          ],
          key: 'billing_and_data',
          label: 'Billing and Data',
          roles: []
        },
        environment_officer: {
          application: 'water_admin',
          groups: [
            {
              description: 'Environment officer',
              group: 'environment_officer',
              id: seededGroupIds.environment_officer,
              roles: [
                {
                  description: 'Send HoF notifications',
                  id: seededRoleIds.hof_notifications,
                  role: 'hof_notifications'
                },
                {
                  description: 'Manage linkages between gauging stations and licences',
                  id: seededRoleIds.manage_gauging_station_licence_links,
                  role: 'manage_gauging_station_licence_links'
                }
              ]
            }
          ],
          key: 'environment_officer',
          label: 'Environment Officer',
          roles: []
        },
        none: {
          application: 'water_vml',
          groups: [],
          key: 'none',
          label: 'None',
          roles: []
        },
        nps: {
          application: 'water_admin',
          groups: [
            {
              description: 'National Permitting Service',
              group: 'nps',
              id: seededGroupIds.nps,
              roles: [
                {
                  description: 'Manage linkages between gauging stations and licences',
                  id: seededRoleIds.manage_gauging_station_licence_links,
                  role: 'manage_gauging_station_licence_links'
                },
                {
                  description: 'Send renewal notifications',
                  id: seededRoleIds.renewal_notifications,
                  role: 'renewal_notifications'
                },
                {
                  description: 'Remove licences registered to a company',
                  id: seededRoleIds.unlink_licences,
                  role: 'unlink_licences'
                },
                {
                  description: 'View charge information',
                  id: seededRoleIds.view_charge_versions,
                  role: 'view_charge_versions'
                }
              ]
            }
          ],
          key: 'nps',
          label: 'National Permitting Service',
          roles: []
        },
        nps_ar_approver: {
          application: 'water_admin',
          groups: [
            {
              description: 'National Permitting Service',
              group: 'nps',
              id: seededGroupIds.nps,
              roles: [
                {
                  description: 'Manage linkages between gauging stations and licences',
                  id: seededRoleIds.manage_gauging_station_licence_links,
                  role: 'manage_gauging_station_licence_links'
                },
                {
                  description: 'Send renewal notifications',
                  id: seededRoleIds.renewal_notifications,
                  role: 'renewal_notifications'
                },
                {
                  description: 'Remove licences registered to a company',
                  id: seededRoleIds.unlink_licences,
                  role: 'unlink_licences'
                },
                {
                  description: 'View charge information',
                  id: seededRoleIds.view_charge_versions,
                  role: 'view_charge_versions'
                }
              ]
            }
          ],
          key: 'nps_ar_approver',
          label: 'National Permitting Service and Digitise! approver',
          roles: [
            {
              description: 'Approve licence data in Digitise! tool',
              id: seededRoleIds.ar_approver,
              role: 'ar_approver'
            }
          ]
        },
        nps_ar_user: {
          application: 'water_admin',
          groups: [
            {
              description: 'National Permitting Service',
              group: 'nps',
              id: seededGroupIds.nps,
              roles: [
                {
                  description: 'Manage linkages between gauging stations and licences',
                  id: seededRoleIds.manage_gauging_station_licence_links,
                  role: 'manage_gauging_station_licence_links'
                },
                {
                  description: 'Send renewal notifications',
                  id: seededRoleIds.renewal_notifications,
                  role: 'renewal_notifications'
                },
                {
                  description: 'Remove licences registered to a company',
                  id: seededRoleIds.unlink_licences,
                  role: 'unlink_licences'
                },
                {
                  description: 'View charge information',
                  id: seededRoleIds.view_charge_versions,
                  role: 'view_charge_versions'
                }
              ]
            }
          ],
          key: 'nps_ar_user',
          label: 'National Permitting Service and Digitise! editor',
          roles: [
            {
              description: 'Edit licence data in Digitise! tool',
              id: seededRoleIds.ar_user,
              role: 'ar_user'
            }
          ]
        },
        primary_user: {
          application: 'water_vml',
          groups: [],
          key: 'primary_user',
          label: 'Primary user',
          roles: []
        },
        psc: {
          application: 'water_admin',
          groups: [
            {
              description: 'Permitting & Support Centre',
              group: 'psc',
              id: seededGroupIds.psc,
              roles: [
                {
                  description: 'Manage linkages between gauging stations and licences',
                  id: seededRoleIds.manage_gauging_station_licence_links,
                  role: 'manage_gauging_station_licence_links'
                },
                {
                  description: 'Send renewal notifications',
                  id: seededRoleIds.renewal_notifications,
                  role: 'renewal_notifications'
                },
                {
                  description: 'Remove licences registered to a company',
                  id: seededRoleIds.unlink_licences,
                  role: 'unlink_licences'
                },
                {
                  description: 'View charge information',
                  id: seededRoleIds.view_charge_versions,
                  role: 'view_charge_versions'
                }
              ]
            }
          ],
          key: 'psc',
          label: 'Permitting and Support Centre',
          roles: []
        },
        returns_user: {
          application: 'water_vml',
          groups: [],
          key: 'returns_user',
          label: 'Returns user',
          roles: []
        },
        wirs: {
          application: 'water_admin',
          groups: [
            {
              description: 'Waste Industry Regulatory Services',
              group: 'wirs',
              id: seededGroupIds.wirs,
              roles: [
                {
                  description: 'Submit and edit returns',
                  id: seededRoleIds.returns,
                  role: 'returns'
                }
              ]
            }
          ],
          key: 'wirs',
          label: 'Waste and Industry Regulatory Service',
          roles: []
        }
      })
    })
  })

  describe('when including super permissions', () => {
    beforeEach(() => {
      includeSuper = true
    })

    it('returns the "super" permissions with the correct group and role IDs and descriptions', async () => {
      const result = await FetchAllPermissionsDetailsDal.go(includeSuper)

      expect(result.super).to.exist()
      expect(result.super).to.equal({
        application: 'water_admin',
        groups: [
          {
            description: 'Super user',
            group: 'super',
            id: seededGroupIds.super,
            roles: [
              {
                description: 'Approve licence data in Digitise! tool',
                id: seededRoleIds.ar_approver,
                role: 'ar_approver'
              },
              {
                description: 'Edit licence data in Digitise! tool',
                id: seededRoleIds.ar_user,
                role: 'ar_user'
              },
              {
                description: 'Administer billing',
                id: seededRoleIds.billing,
                role: 'billing'
              },
              {
                description: 'Send bulk return invitations and reminder notifications',
                id: seededRoleIds.bulk_return_notifications,
                role: 'bulk_return_notifications'
              },
              {
                description: 'Create and edit charge information workflow data',
                id: seededRoleIds.charge_version_workflow_editor,
                role: 'charge_version_workflow_editor'
              },
              {
                description: 'Approve charge information workflow data',
                id: seededRoleIds.charge_version_workflow_reviewer,
                role: 'charge_version_workflow_reviewer'
              },
              {
                description: 'Delete licence agreements',
                id: seededRoleIds.delete_agreements,
                role: 'delete_agreements'
              },
              {
                description: 'Send HoF notifications',
                id: seededRoleIds.hof_notifications,
                role: 'hof_notifications'
              },
              {
                description: 'Create and manage internal user accounts',
                id: seededRoleIds.manage_accounts,
                role: 'manage_accounts'
              },
              {
                description: 'Create and edit licence agreements',
                id: seededRoleIds.manage_agreements,
                role: 'manage_agreements'
              },
              {
                description: 'View invoice accounts and change invoice account address',
                id: seededRoleIds.manage_billing_accounts,
                role: 'manage_billing_accounts'
              },
              {
                description: 'Manage linkages between gauging stations and licences',
                id: seededRoleIds.manage_gauging_station_licence_links,
                role: 'manage_gauging_station_licence_links'
              },
              {
                description: 'Send renewal notifications',
                id: seededRoleIds.renewal_notifications,
                role: 'renewal_notifications'
              },
              {
                description: 'Submit and edit returns',
                id: seededRoleIds.returns,
                role: 'returns'
              },
              {
                description: 'Remove licences registered to a company',
                id: seededRoleIds.unlink_licences,
                role: 'unlink_licences'
              },
              {
                description: 'View charge information',
                id: seededRoleIds.view_charge_versions,
                role: 'view_charge_versions'
              }
            ]
          }
        ],
        key: 'super',
        label: 'Super user',
        roles: []
      })
    })
  })

  describe('when excluding super permissions', () => {
    beforeEach(() => {
      includeSuper = false
    })

    it('does not include super permissions in the returned value', async () => {
      const result = await FetchAllPermissionsDetailsDal.go(includeSuper)

      expect(result.super).to.not.exist()
    })
  })
})
