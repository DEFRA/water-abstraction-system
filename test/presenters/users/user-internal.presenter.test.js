'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Things to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

// Thing under test
const UserInternalPresenter = require('../../../app/presenters/users/user-internal.presenter.js')

describe('Users - User Internal Presenter', () => {
  let user

  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableUsersView').value(true)

    user = UsersFixture.basicAccess()
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly presents the data', () => {
    const result = UserInternalPresenter.go(user)

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
      status: 'enabled'
    })
  })

  describe('the "lastSignedIn" property', () => {
    describe('when the lastLogin is not "null"', () => {
      it('returns the date and time of the last login', () => {
        const result = UserInternalPresenter.go(user)

        expect(result.lastSignedIn).to.equal('6 October 2022 at 10:00:00')
      })
    })

    describe('when the lastLogin is "null"', () => {
      beforeEach(() => {
        user.lastLogin = null
      })

      it('returns "Never signed in"', () => {
        const result = UserInternalPresenter.go(user)

        expect(result.lastSignedIn).to.equal('Never signed in')
      })
    })
  })
})
