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
const FetchUserDal = require('../../../../app/dal/users/fetch-user.dal.js')
const FetchLicencesDal = require('../../../../app/dal/users/external/fetch-licences.dal.js')

// Thing under test
const ViewLicencesService = require('../../../../app/services/users/external/view-licences.service.js')

describe('Users - External - View Licences service', () => {
  const auth = {
    credentials: { scope: ['manage_accounts'] }
  }
  const page = '1'

  let back
  let user

  beforeEach(() => {
    const { id, username } = UsersFixture.external()

    user = { id, licenceEntityId: 'b2c55396-9bbb-448d-85e7-2be1dbefc02b', username }

    Sinon.stub(FetchUserDal, 'go').resolves(user)
    Sinon.stub(FetchLicencesDal, 'go').resolves({
      licences: [],
      totalNumber: 0
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicencesService.go(user.id, auth, page, back)

      expect(result).to.equal({
        activeNavBar: 'users',
        activeSecondaryNav: 'licences',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 0,
          showingMessage: 'Showing all 0 licences'
        },
        backLink: {
          href: '/system/users',
          text: 'Go back to users'
        },
        backQueryString: '?back=users',
        displayLicenceEndedMessage: false,
        pageTitle: 'Licences',
        pageTitleCaption: user.username,
        licences: [],
        showUnlinkButton: true
      })
    })
  })
})
