'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Things we want to stub
const FetchUserInternalService = require('../../../app/services/users/fetch-user-internal.service.js')

// Thing under test
const ViewUserInternalService = require('../../../app/services/users/view-user-internal.service.js')

describe('Users - View User Internal service', () => {
  const user = UsersFixture.basicAccess()

  beforeEach(() => {
    Sinon.stub(FetchUserInternalService, 'go').resolves(user)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the internal user view', async () => {
      const result = await ViewUserInternalService.go(user.id)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        id: user.id,
        lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
        pageTitle: 'User basic.access@wrls.gov.uk',
        pageTitleCaption: 'Internal',
        permissions: 'Basic access',
        status: 'enabled'
      })
    })
  })
})
