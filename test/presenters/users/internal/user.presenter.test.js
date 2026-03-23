'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../../support/fixtures/users.fixture.js')

// Things to stub
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')

// Thing under test
const UserPresenter = require('../../../../app/presenters/users/internal/user.presenter.js')

describe('Users - Internal - User Presenter', () => {
  let canEdit
  let user

  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableUsersView').value(true)

    user = UsersFixture.basicAccess()
    canEdit = true
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly presents the data', () => {
    const result = UserPresenter.go(user, canEdit)

    expect(result).to.equal({
      backLink: {
        href: '/system/users',
        text: 'Go back to users'
      },
      id: user.id,
      lastSignedIn: '6 October 2022 at 10:00:00',
      pageTitle: 'User basic.access@wrls.gov.uk',
      pageTitleCaption: 'Internal',
      permissions: 'Basic access',
      roles: [],
      showEditButton: true,
      status: 'enabled'
    })
  })

  describe('the "lastSignedIn" property', () => {
    describe('when the lastLogin is not "null"', () => {
      it('returns the date and time of the last login', () => {
        const result = UserPresenter.go(user, canEdit)

        expect(result.lastSignedIn).to.equal('6 October 2022 at 10:00:00')
      })
    })

    describe('when the lastLogin is "null"', () => {
      beforeEach(() => {
        user.lastLogin = null
      })

      it('returns "Never signed in"', () => {
        const result = UserPresenter.go(user, canEdit)

        expect(result.lastSignedIn).to.equal('Never signed in')
      })
    })
  })

  describe('the "roles" property', () => {
    describe('when the user has no group or user roles', () => {
      it('returns an empty array', () => {
        const result = UserPresenter.go(user, canEdit)

        expect(result.roles).to.equal([])
      })
    })

    describe('when the user has only a group', () => {
      beforeEach(() => {
        user = UsersFixture.environmentOfficer()

        UsersFixture.transformToFetchUserInternalResult(user)
      })

      it('returns the "roles" for the group in sentence case, sorted by name', () => {
        const result = UserPresenter.go(user, canEdit)

        expect(result.roles).to.equal([
          {
            description: 'Send HoF notifications',
            name: 'HOF notifications'
          },
          {
            description: 'Manage linkages between gauging stations and licences',
            name: 'Manage gauging station licence links'
          }
        ])
      })
    })

    describe('when the user has a group and user roles', () => {
      beforeEach(() => {
        user = UsersFixture.digitiseApprover()

        UsersFixture.transformToFetchUserInternalResult(user)
      })

      it('returns all "roles" in sentence case, sorted by name', () => {
        const result = UserPresenter.go(user, canEdit)

        expect(result.roles).to.equal([
          {
            description: 'Approve licence data in Digitise! tool',
            name: 'AR approver'
          },
          {
            description: 'Manage linkages between gauging stations and licences',
            name: 'Manage gauging station licence links'
          },
          {
            description: 'Send renewal notifications',
            name: 'Renewal notifications'
          },
          {
            description: 'Remove licences registered to a company',
            name: 'Unlink licences'
          },
          {
            description: 'View charge information',
            name: 'View charge versions'
          }
        ])
      })
    })
  })
})
