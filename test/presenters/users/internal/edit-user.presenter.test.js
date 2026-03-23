'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../../support/fixtures/users.fixture.js')

// Thing under test
const EditUserPresenter = require('../../../../app/presenters/users/internal/edit-user.presenter.js')

describe('Users - Internal - Edit User Presenter', () => {
  let allPermissionsDetails
  let permissions
  let user

  beforeEach(() => {
    user = UsersFixture.basicAccess()
    allPermissionsDetails = {}
    permissions = 'basic'
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = EditUserPresenter.go(user, allPermissionsDetails, permissions)

      expect(result).to.equal({
        cancelLink: { href: `/system/users/internal/${user.id}`, text: 'Cancel' },
        id: user.id,
        lastSignedIn: '6 October 2022 at 10:00:00',
        pageTitle: 'User basic.access@wrls.gov.uk',
        pageTitleCaption: 'Internal',
        permissionOptions: [],
        permissions: 'basic',
        status: 'enabled'
      })
    })
  })

  describe('the "lastSignedIn" property', () => {
    describe('when the lastLogin is "null"', () => {
      beforeEach(() => {
        user.lastLogin = null
      })

      it('returns "Never signed in"', () => {
        const result = EditUserPresenter.go(user, allPermissionsDetails, permissions)

        expect(result.lastSignedIn).to.equal('Never signed in')
      })
    })
  })

  describe('the "permissionOptions" property', () => {
    describe('when a permission has no group or roles', () => {
      beforeEach(() => {
        allPermissionsDetails = {
          basic: {
            application: 'both',
            groups: [],
            key: 'basic',
            label: 'Basic access',
            roles: []
          }
        }
      })

      it('returns an option that "Grants no additional roles"', () => {
        const result = EditUserPresenter.go(user, allPermissionsDetails, permissions)

        expect(result.permissionOptions[0]).to.equal({
          checked: true,
          hint: { text: 'Grants no additional roles' },
          text: 'Basic access',
          value: 'basic'
        })
      })
    })

    describe('when a permission has only a group', () => {
      beforeEach(() => {
        allPermissionsDetails = {
          environment_officer: {
            application: 'water_admin',
            groups: [
              {
                description: 'Environment officer',
                group: 'environment_officer',
                roles: [
                  {
                    description: 'Send HoF notifications',
                    role: 'hof_notifications'
                  },
                  {
                    description: 'Manage linkages between gauging stations and licences',
                    role: 'manage_gauging_station_licence_links'
                  }
                ]
              }
            ],
            key: 'environment_officer',
            label: 'Environment Officer',
            roles: []
          }
        }
      })

      it('returns an option that grants the roles for the group', () => {
        const result = EditUserPresenter.go(user, allPermissionsDetails, permissions)

        expect(result.permissionOptions[0]).to.equal({
          checked: false,
          hint: { text: 'Grants: HOF notifications, Manage gauging station licence links' },
          text: 'Environment Officer',
          value: 'environment_officer'
        })
      })
    })

    describe('when a permission has a group and additional roles', () => {
      beforeEach(() => {
        allPermissionsDetails = {
          nps_ar_approver: {
            application: 'water_admin',
            groups: [
              {
                description: 'National Permitting Service',
                group: 'nps',
                roles: [
                  {
                    description: 'Manage linkages between gauging stations and licences',
                    role: 'manage_gauging_station_licence_links'
                  },
                  {
                    description: 'Send renewal notifications',
                    role: 'renewal_notifications'
                  },
                  {
                    description: 'Remove licences registered to a company',
                    role: 'unlink_licences'
                  },
                  {
                    description: 'View charge information',
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
                role: 'ar_approver'
              }
            ]
          }
        }
      })

      it('returns an option that grants the roles for the group and the additional roles', () => {
        const result = EditUserPresenter.go(user, allPermissionsDetails, permissions)

        expect(result.permissionOptions[0]).to.equal({
          checked: false,
          hint: {
            text: 'Grants: AR approver, Manage gauging station licence links, Renewal notifications, Unlink licences, View charge versions'
          },
          text: 'National Permitting Service and Digitise! approver',
          value: 'nps_ar_approver'
        })
      })
    })
  })
})
