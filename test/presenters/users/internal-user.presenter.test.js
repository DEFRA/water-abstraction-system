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
const InternalUserPresenter = require('../../../app/presenters/users/internal-user.presenter.js')

describe('Users - Internal User Presenter', () => {
  let user

  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableUsersView').value(true)

    user = UsersFixture.basicAccess()
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly presents the data', () => {
    const result = InternalUserPresenter.go(user)

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
      status: 'enabled'
    })
  })

  describe('the "lastSignedIn" property', () => {
    describe('when the lastLogin is "null"', () => {
      beforeEach(() => {
        user = UsersFixture.basicAccess()
        user.lastLogin = null
      })

      it('returns "Never signed in"', () => {
        const result = InternalUserPresenter.go(user)

        expect(result.lastSignedIn).to.equal('Never signed in')
      })
    })
  })
})
