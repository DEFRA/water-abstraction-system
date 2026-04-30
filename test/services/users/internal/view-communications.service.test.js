'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UserFixture = require('../../../support/fixtures/users.fixture.js')

// Things we need to stub
const FetchNotificationsService = require('../../../../app/services/users/internal/fetch-notifications.service.js')
const FetchUserService = require('../../../../app/services/users/internal/fetch-user.service.js')

// Thing under test
const ViewCommunicationsService = require('../../../../app/services/users/internal/view-communications.service.js')

describe('Users - Internal - View Communications Service', () => {
  const page = '1'

  let user

  beforeEach(async () => {
    const { id, username } = UserFixture.billingAndData()

    user = { id, username }

    Sinon.stub(FetchUserService, 'go').returns(user)

    Sinon.stub(FetchNotificationsService, 'go').returns({
      notifications: [],
      totalNumber: 0
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCommunicationsService.go(user.id, page)

      expect(result).to.equal({
        activeNavBar: 'users',
        activeSecondaryNav: 'communications',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 0,
          showingMessage: 'Showing all 0 communications'
        },
        backLink: {
          href: `/system/users`,
          text: 'Go back to users'
        },
        notifications: [],
        pageTitle: `Communications for ${user.username}`,
        pageTitleCaption: 'Internal'
      })
    })
  })
})
