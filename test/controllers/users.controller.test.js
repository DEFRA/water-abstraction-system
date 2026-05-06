'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const FeatureFlagsConfig = require('../../config/feature-flags.config.js')
const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = require('node:http2').constants
const { generateUUID } = require('../../app/lib/general.lib.js')
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const FetchLegacyIdDal = require('../../app/dal/users/fetch-legacy-id.dal.js')
const IndexUsersService = require('../../app/services/users/index-users.service.js')
const SubmitIndexUsersService = require('../../app/services/users/submit-index-users.service.js')
const SubmitProfileDetailsService = require('../../app/services/users/submit-profile-details.service.js')
const ViewExternalDetailsService = require('../../app/services/users/external/view-details.service.js')
const ViewExternalLicencesService = require('../../app/services/users/external/view-licences.service.js')
const ViewExternalVerificationsService = require('../../app/services/users/external/view-verifications.service.js')
const ViewInternalCommunicationsService = require('../../app/services/users/internal/view-communications.service.js')
const ViewInternalDetailsService = require('../../app/services/users/internal/view-details.service.js')
const ViewNotificationService = require('../../app/services/users/view-notification.service.js')
const ViewProfileDetailsService = require('../../app/services/users/view-profile-details.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Users controller', () => {
  let id
  let options
  let notificationId
  let postOptions
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
    Sinon.stub(FeatureFlagsConfig, 'enableUsersManagement').value(true)

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/users', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = _getOptions('/users', { scope: ['manage_accounts'] })
      })

      describe('with no pagination', () => {
        beforeEach(() => {
          const pageData = _usersPageData()

          Sinon.stub(IndexUsersService, 'go').returns(pageData)
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Users')
          expect(response.payload).to.contain('Showing all 1 users')
        })
      })

      describe('with pagination', () => {
        beforeEach(() => {
          options.url = '/users?page=2'

          const pageData = _usersPageData()

          pageData.pageTitle = 'Users'
          pageData.pagination.showingMessage = 'Showing 25 of 70 users'

          Sinon.stub(IndexUsersService, 'go').returns(pageData)
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Users')
          expect(response.payload).to.contain('Showing 25 of 70 users')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/users', {}, ['manage_accounts'])
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitIndexUsersService, 'go').returns({})
        })

        it('redirects back to the index page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/system/users`)
        })
      })

      describe('when the request fails', () => {
        describe('with no pagination', () => {
          beforeEach(() => {
            const pageData = _usersPageData(true)

            Sinon.stub(SubmitIndexUsersService, 'go').returns(pageData)
          })

          it('re-renders the index page with no pagination and an error', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(HTTP_STATUS_OK)

            expect(response.payload).to.contain('There is a problem')
            expect(response.payload).to.contain('Users')
            expect(response.payload).to.contain('Showing all 1 users')
          })
        })

        describe('with pagination', () => {
          beforeEach(async () => {
            const pageData = _usersPageData(true)

            pageData.pageTitle = 'Users'
            pageData.pagination.showingMessage = 'Showing 25 of 70 users'

            Sinon.stub(SubmitIndexUsersService, 'go').returns(pageData)
          })

          it('re-renders the index page with pagination and an error', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(HTTP_STATUS_OK)

            expect(response.payload).to.contain('There is a problem')
            expect(response.payload).to.contain('Users')
            expect(response.payload).to.contain('Showing 25 of 70 users')
          })
        })
      })
    })
  })

  describe('/users/external/{id}/details', () => {
    describe('GET', () => {
      beforeEach(async () => {
        id = generateUUID()
        options = _getOptions(`/users/external/${id}/details`, { scope: [], user: { id } })

        Sinon.stub(ViewExternalDetailsService, 'go').resolves({
          activeNavBar: 'users',
          activeSecondaryNav: 'details',
          backLink: {
            href: '/system/users',
            text: 'Go back to users'
          },
          backQueryString: '?back=users',
          lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
          pageTitle: 'User details',
          pageTitleCaption: 'external@example.co.uk',
          permissions: 'None',
          roles: [],
          status: 'enabled'
        })
      })

      it('returns the external user page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('User details')
      })
    })
  })

  describe('/users/external/{id}/licences', () => {
    describe('GET', () => {
      beforeEach(async () => {
        id = generateUUID()
        options = _getOptions(`/users/external/${id}/licences`, { scope: [], user: { id } })

        Sinon.stub(ViewExternalLicencesService, 'go').resolves({
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
          pageTitleCaption: 'external@example.co.uk',
          licences: [],
          showUnlinkButton: true
        })
      })

      it('returns the external user page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Licences')
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        id = generateUUID()
        postOptions = postRequestOptions(`/users/external/${id}/licences`, {})
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(FetchLegacyIdDal, 'go').returns(456)
        })

        it('redirects to the legacy user page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/user/456/status`)
        })
      })
    })
  })

  describe('/users/external/{id}/verifications', () => {
    describe('GET', () => {
      beforeEach(async () => {
        id = generateUUID()
        options = _getOptions(`/users/external/${id}/verifications`, { scope: [], user: { id } })

        Sinon.stub(ViewExternalVerificationsService, 'go').resolves({
          activeNavBar: 'users',
          activeSecondaryNav: 'verifications',
          pagination: {
            currentPageNumber: 1,
            numberOfPages: 0,
            showingMessage: 'Showing all 0 verifications'
          },
          backLink: {
            href: '/system/users',
            text: 'Go back to users'
          },
          backQueryString: '?back=users',
          pageTitle: 'Verifications',
          pageTitleCaption: 'external@example.co.uk',
          verifications: []
        })
      })

      it('returns the external user page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Verifications')
      })
    })
  })

  describe('/users/internal/{id}/communications', () => {
    describe('GET', () => {
      beforeEach(async () => {
        id = generateUUID()
        options = _getOptions(`/users/internal/${id}/communications`, { scope: ['manage_accounts'], user: { id } })

        Sinon.stub(ViewInternalCommunicationsService, 'go').resolves({
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
          pageTitle: 'Communications',
          pageTitleCaption: 'carol.shaw@wrls.gov.uk'
        })
      })

      it('returns the internal user page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Communications')
      })
    })
  })

  describe('/users/internal/{id}/details', () => {
    describe('GET', () => {
      beforeEach(async () => {
        id = generateUUID()
        options = _getOptions(`/users/internal/${id}/details`, { scope: ['manage_accounts'], user: { id } })

        Sinon.stub(ViewInternalDetailsService, 'go').resolves({
          activeNavBar: 'users',
          activeSecondaryNav: 'details',
          backLink: {
            href: '/system/users',
            text: 'Go back to users'
          },
          id,
          lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
          pageTitle: 'User details',
          pageTitleCaption: 'basic.access@wrls.gov.uk',
          permissions: 'Basic access',
          roles: [],
          status: 'enabled'
        })
      })

      it('returns the internal user page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('User details')
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        id = generateUUID()
        postOptions = postRequestOptions(`/users/internal/${id}/details`, {})
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(FetchLegacyIdDal, 'go').returns(456)
        })

        it('redirects to the legacy user page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
          expect(response.headers.location).to.equal(`/user/456/status`)
        })
      })
    })
  })

  describe('/users/internal/{id}/notifications/{notificationId}', () => {
    describe('GET', () => {
      beforeEach(async () => {
        id = generateUUID()
        notificationId = generateUUID()
        options = _getOptions(`/users/internal/${id}/notifications/${notificationId}`, {
          scope: ['manage_accounts'],
          user: { id }
        })

        Sinon.stub(ViewNotificationService, 'go').resolves({
          activeNavBar: 'users',
          backLink: {
            href: `/system/users/internal/${id}/communications`,
            text: 'Go back to user'
          },
          contents: '## This content is protected.',
          errorDetails: null,
          messageType: 'email',
          pageTitle: 'Password reset',
          pageTitleCaption: 'carol.shaw@wrls.gov.uk',
          sentDate: '18 April 2025',
          sentTo: 'carol.shaw@wrls.gov.uk',
          status: 'sent'
        })
      })

      it('returns the internal user page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(HTTP_STATUS_OK)
        expect(response.payload).to.contain('Password reset')
      })
    })
  })

  describe('/users/me/profile-details', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions('/users/me/profile-details', { scope: ['hof_notifications'], user: { id: 1000 } })

        Sinon.stub(ViewProfileDetailsService, 'go').resolves({
          pageTitle: 'Profile details'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(HTTP_STATUS_OK)
          expect(response.payload).to.contain('Profile details')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/users/me/profile-details', {}, ['hof_notifications'])
      })

      describe('when the request succeeds', () => {
        describe('and is valid', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitProfileDetailsService, 'go').resolves({})
          })

          it('redirects to itself', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(HTTP_STATUS_FOUND)
            expect(response.headers.location).to.equal('/system/users/me/profile-details')
          })
        })

        describe('and the validation fails', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitProfileDetailsService, 'go').resolves({ error: { details: [] } })
          })

          it('returns the page successfully with the error summary banner', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(HTTP_STATUS_OK)
            expect(response.payload).to.contain('There is a problem')
          })
        })
      })
    })
  })
})

function _getOptions(url, credentials) {
  return {
    method: 'GET',
    url,
    auth: {
      strategy: 'session',
      credentials
    }
  }
}

function _usersPageData(error = false) {
  const pageData = {
    filters: {
      email: null,
      openFilter: true,
      permissions: null,
      status: null,
      type: null
    },
    links: {
      user: {
        href: '/account/create-user',
        text: 'Create a user'
      }
    },
    pageTitle: 'Users',
    users: [
      {
        email: 'basic.access@wrls.gov.uk',
        link: '/user/10016/status',
        permissions: 'Basic access',
        status: 'enabled',
        type: 'Internal'
      }
    ],
    pagination: { currentPageNumber: 1, numberOfPages: 1, showingMessage: 'Showing all 1 users' }
  }

  if (error) {
    pageData.filters.type = 'foo'
    pageData.error = {
      errorList: [
        {
          href: '#type',
          text: 'Select a valid type'
        }
      ],
      type: {
        text: 'Select a valid type'
      }
    }
  }

  return pageData
}
