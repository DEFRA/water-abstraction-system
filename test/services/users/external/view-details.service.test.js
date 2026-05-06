'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../../support/fixtures/users.fixture.js')

// Things we want to stub
const FetchLicencesDal = require('../../../../app/dal/users/external/fetch-licences.dal.js')
const FetchUserDetailsDal = require('../../../../app/dal/users/external/fetch-user-details.dal.js')

// Thing under test
const ViewDetailsService = require('../../../../app/services/users/external/view-details.service.js')

describe('Users - External - View Details service', () => {
  const auth = {
    credentials: { scope: ['manage_accounts'] }
  }
  const user = UsersFixture.external()

  let back

  beforeEach(() => {
    Sinon.stub(FetchUserDetailsDal, 'go').resolves(user)
    Sinon.stub(FetchLicencesDal, 'go').resolves([])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the external user view', async () => {
      const result = await ViewDetailsService.go(user.id, auth, back)

      expect(result).to.equal({
        activeNavBar: 'users',
        activeSecondaryNav: 'details',
        backLink: {
          href: '/system/users',
          text: 'Go back to users'
        },
        backQueryString: '?back=users',
        displayLicenceEndedMessage: false,
        lastSignedIn: '6 October 2022 at 10:00:00',
        licences: [],
        pageTitle: 'User details',
        pageTitleCaption: user.username,
        permissions: 'None',
        roles: [],
        showEditButton: true,
        status: 'enabled'
      })
    })
  })
})
