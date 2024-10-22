'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const ReviewBillRunService = require('../../app/services/bill-runs/review/review-bill-run.service.js')
const SubmitReviewBillRunService = require('../../app/services/bill-runs/review/submit-review-bill-run.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Bill Runs Review controller', () => {
  let options
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/bill-runs/{id}/review', () => {
    describe('GET', () => {
      let ReviewBillRunServiceStub

      describe('when a request is valid with no pagination', () => {
        beforeEach(() => {
          options = _getRequestOptions()
          ReviewBillRunServiceStub = Sinon.stub(ReviewBillRunService, 'go').resolves(_reviewBillRunData())
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)
          const ReviewBillRunServiceArgs = ReviewBillRunServiceStub.args[0]

          expect(response.statusCode).to.equal(200)
          expect(ReviewBillRunServiceArgs[0]).to.equal('97db1a27-8308-4aba-b463-8a6af2558b28')
          expect(ReviewBillRunServiceArgs[1]).to.equal(undefined)
          expect(response.payload).to.contain('two-part tariff')
          expect(response.payload).to.contain('Southern (Test replica)')
          expect(response.payload).to.contain('Showing all 2 licences')
        })
      })

      describe('when a request is valid with pagination', () => {
        beforeEach(() => {
          options = _getRequestOptions(null, 'page=2')
          ReviewBillRunServiceStub = Sinon.stub(ReviewBillRunService, 'go').resolves(_reviewBillRunData())
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)
          const ReviewBillRunServiceArgs = ReviewBillRunServiceStub.args[0]

          expect(response.statusCode).to.equal(200)
          expect(ReviewBillRunServiceArgs[0]).to.equal('97db1a27-8308-4aba-b463-8a6af2558b28')
          expect(ReviewBillRunServiceArgs[1]).to.equal('2')
          expect(response.payload).to.contain('two-part tariff')
          expect(response.payload).to.contain('Southern (Test replica)')
          expect(response.payload).to.contain('Showing all 2 licences')
        })
      })
    })

    describe('POST', () => {
      beforeEach(async () => {
        options = postRequestOptions('/bill-runs/review/97db1a27-8308-4aba-b463-8a6af2558b28')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitReviewBillRunService, 'go').resolves()
        })

        it('redirects to the review licences page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/review/97db1a27-8308-4aba-b463-8a6af2558b28'
          )
        })
      })
    })
  })
})

function _getRequestOptions (path, query = null) {
  const root = '/bill-runs/review/97db1a27-8308-4aba-b463-8a6af2558b28'
  const rootPath = path ? `${root}/${path}` : root
  const url = query ? `${rootPath}?${query}` : rootPath

  return {
    method: 'GET',
    url,
    auth: {
      strategy: 'session',
      credentials: { scope: ['billing'] }
    }
  }
}

function _reviewBillRunData () {
  return {
    region: 'Southern (Test replica)',
    status: 'review',
    dateCreated: '6 November 2023',
    financialYear: '2021 to 2022',
    billRunType: 'two-part tariff',
    numberOfLicencesDisplayed: 2,
    numberOfLicencesToReview: 1,
    totalNumberOfLicences: 2,
    preparedLicences: [
      {
        licenceId: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
        licenceRef: '1/11/11/*1/1111',
        licenceHolder: 'Big Farm Ltd',
        status: 'review',
        issue: 'Multiple Issues'
      },
      {
        licenceId: '9442527a-64f3-471a-a3e4-fa0683a3d505',
        licenceRef: '2/22/22/*2/2222',
        licenceHolder: 'Small Farm Ltd',
        status: 'ready',
        issue: 'Multiple Issues'
      }
    ],
    filter: {
      issues: undefined,
      licenceHolder: undefined,
      licenceStatus: undefined,
      openFilter: false
    }
  }
}
