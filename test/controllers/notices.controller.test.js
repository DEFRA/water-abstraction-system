'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const IndexNoticesService = require('../../app/services/notices/index-notices.service.js')
const SubmitIndexNoticesService = require('../../app/services/notices/submit-index-notices.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Notices controller', () => {
  let options
  let postOptions
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/notices', () => {
    describe('GET', () => {
      describe('with no pagination', () => {
        beforeEach(() => {
          options = {
            method: 'GET',
            url: '/notices',
            auth: {
              strategy: 'session',
              credentials: { scope: ['returns'] }
            }
          }

          const pageData = _noticePageData()

          Sinon.stub(IndexNoticesService, 'go').returns(pageData)
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Notices')
          expect(response.payload).to.contain('Showing all 1 notices')
        })
      })

      describe('with pagination', () => {
        beforeEach(() => {
          options = {
            method: 'GET',
            url: '/notices?page=2',
            auth: {
              strategy: 'session',
              credentials: { scope: ['returns'] }
            }
          }

          const pageData = _noticePageData()

          pageData.pageTitle = 'Notices (page 2 of 3)'
          pageData.tableCaption = 'Showing 25 of 70 notices'

          Sinon.stub(IndexNoticesService, 'go').returns(pageData)
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Notices (page 2 of 3)')
          expect(response.payload).to.contain('Showing 25 of 70 notices')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/notices', {})
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitIndexNoticesService, 'go').returns({})
        })

        it('redirects back to the index page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/notices`)
        })
      })

      describe('when the request fails', () => {
        describe('with no pagination', () => {
          beforeEach(() => {
            const pageData = _noticePageData(true)

            Sinon.stub(SubmitIndexNoticesService, 'go').returns(pageData)
          })

          it('re-renders the index page with no pagination and an error', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(200)

            expect(response.payload).to.contain('There is a problem')
            expect(response.payload).to.contain('Notices')
            expect(response.payload).to.contain('Showing all 1 notices')
          })
        })

        describe('with pagination', () => {
          beforeEach(async () => {
            const pageData = _noticePageData(true)

            pageData.pageTitle = 'Notices (page 2 of 3)'
            pageData.tableCaption = 'Showing 25 of 70 notices'

            Sinon.stub(SubmitIndexNoticesService, 'go').returns(pageData)
          })

          it('re-renders the index page with pagination and an error', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(200)

            expect(response.payload).to.contain('There is a problem')
            expect(response.payload).to.contain('Notices (page 2 of 3)')
            expect(response.payload).to.contain('Showing 25 of 70 notices')
          })
        })
      })
    })
  })
})

function _noticePageData(error = false) {
  const pageData = {
    activeNavBar: 'manage',
    filters: {
      noticeTypes: [],
      openFilter: false,
      toDate: undefined
    },
    notices: [
      {
        createdDate: '25 March 2025',
        link: '/notifications/report/5a5ea1cc-580c-4921-a5a5-297bd7885bae',
        recipients: 123,
        sentBy: 'billing.data@wrls.gov.uk',
        status: 'sent',
        type: 'Stop - Water abstraction alert'
      }
    ],
    pageTitle: 'Notices',
    tableCaption: 'Showing all 1 notices'
  }

  if (error) {
    pageData.error = {
      errorList: [{ href: '#fromDate', text: 'Enter a valid from date' }],
      fromDate: { message: 'Enter a valid from date' }
    }
  }

  return pageData
}
