'use strict'

// Test framework dependencies
const { describe, it, before, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const CheckService = require('../../app/services/bill-runs/setup/check.service.js')
const InitiateSessionService = require('../../app/services/bill-runs/setup/initiate-session.service.js')
const NoLicencesService = require('../../app/services/bill-runs/setup/no-licences.service.js')
const RegionService = require('../../app/services/bill-runs/setup/region.service.js')
const SeasonService = require('../../app/services/bill-runs/setup/season.service.js')
const SubmitCheckService = require('../../app/services/bill-runs/setup/submit-check.service.js')
const SubmitRegionService = require('../../app/services/bill-runs/setup/submit-region.service.js')
const SubmitSeasonService = require('../../app/services/bill-runs/setup/submit-season.service.js')
const SubmitTypeService = require('../../app/services/bill-runs/setup/submit-type.service.js')
const SubmitYearService = require('../../app/services/bill-runs/setup/submit-year.service.js')
const TypeService = require('../../app/services/bill-runs/setup/type.service.js')
const YearService = require('../../app/services/bill-runs/setup/year.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Bill Runs Setup controller', () => {
  let options
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  // Create server before each test
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

  describe('/bill-runs/setup', () => {
    describe('GET', () => {
      const session = { id: 'e009b394-8405-4358-86af-1a9eb31298a5', data: {} }

      beforeEach(async () => {
        options = _getOptions('')
        options.url = '/bill-runs/setup'
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
        })

        it('redirects to select bill run type page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/bill-runs/setup/${session.id}/type`)
        })
      })
    })
  })

  describe('/bill-runs/setup/{sessionId}/check', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions('check')
      })

      describe('when the request succeeds', () => {
        describe('but there is an existing bill run', () => {
          beforeEach(() => {
            Sinon.stub(CheckService, 'go').resolves({
              backLink: '/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region',
              billRunLink: '/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182',
              billRunNumber: 12345,
              billRunStatus: 'sent',
              billRunType: 'Annual',
              chargeScheme: 'Current',
              dateCreated: '1 May 2024',
              exists: true,
              financialYear: '2024 to 2025',
              pageTitle: 'This bill run already exists',
              regionName: 'Stormlands',
              sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
              warningMessage: 'You can only have one Annual bill run per region in a financial year'
            })
          })

          it('returns the "check" page displaying the existing bill run', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('This bill run already exists')
            expect(response.payload).to.contain('c0608545-9870-4605-a407-5ff49f8a5182')
          })
        })

        describe('and there is no existing bill run', () => {
          beforeEach(() => {
            Sinon.stub(CheckService, 'go').resolves({
              backLink: '/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region',
              billRunLink: null,
              billRunNumber: null,
              billRunStatus: null,
              billRunType: 'Annual',
              chargeScheme: 'Current',
              dateCreated: null,
              exists: false,
              financialYear: '2024 to 2025',
              pageTitle: 'Check the bill run to be created',
              regionName: 'Stormlands',
              sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
              warningMessage: null
            })
          })

          it('returns the "check" page displaying the bill run to be created', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Check the bill run to be created')
          })
        })
      })
    })

    describe('POST', () => {
      describe('when no one else has kicked off a blocking bill run whilst this one is in progress', () => {
        beforeEach(async () => {
          options = _postOptions('check')
          Sinon.stub(SubmitCheckService, 'go').resolves({})
        })

        it('redirects to the bill runs page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/system/bill-runs')
        })
      })

      describe('when someone else has kicked off a blocking bill run whilst this one is in progress', () => {
        beforeEach(async () => {
          options = _postOptions('check')

          Sinon.stub(SubmitCheckService, 'go').resolves({
            error: true,
            backLink: '/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region',
            billRunLink: '/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182',
            billRunNumber: 12345,
            billRunStatus: 'sent',
            billRunType: 'Annual',
            chargeScheme: 'Current',
            dateCreated: '1 May 2024',
            exists: true,
            financialYear: '2024 to 2025',
            pageTitle: 'This bill run already exists',
            regionName: 'Stormlands',
            sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
            warningMessage: 'You can only have one Annual bill run per region in a financial year'
          })
        })

        it('re-renders the "check" page displaying the existing bill run', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('This bill run already exists')
          expect(response.payload).to.contain('c0608545-9870-4605-a407-5ff49f8a5182')
        })
      })
    })
  })

  describe('/bill-runs/setup/{sessionId}/no-licences', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions('no-licences')

        Sinon.stub(NoLicencesService, 'go').resolves({
          pageTitle: 'There are no licences marked for two-part tariff supplementary billing in the Test region',
          sessionId: '173ad76b-8400-43fb-a8d6-323d318a511e'
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain(
            'There are no licences marked for two-part tariff supplementary billing in the Test region'
          )
        })
      })
    })
  })

  describe('/bill-runs/setup/{sessionId}/region', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions('region')

        Sinon.stub(RegionService, 'go').resolves({
          pageTitle: 'Select the region',
          regions: [
            { id: 'e21b987c-7a5f-4eb3-a794-e4aae4a96a28', displayName: 'Riverlands' },
            { id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'Stormlands' }
          ],
          sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
          selectedRegion: null
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the region')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(async () => {
          options = _postOptions('region', { region: '19a027c6-4aad-47d3-80e3-3917a4579a5b' })
        })

        describe('and the bill run setup is complete', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitRegionService, 'go').resolves({ setupComplete: true })
          })

          it('redirects to the "check" page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              '/system/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/check'
            )
          })
        })

        describe('and the bill run setup is not complete', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitRegionService, 'go').resolves({ setupComplete: false })
          })

          it('redirects to the "select financial year" page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              '/system/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/year'
            )
          })
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          options = _postOptions('region', { region: '' })

          Sinon.stub(SubmitRegionService, 'go').resolves({
            error: { text: 'Select a region' },
            pageTitle: 'Select a region',
            regions: [{ id: 'e21b987c-7a5f-4eb3-a794-e4aae4a96a28', displayName: 'Riverlands' }],
            sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
            selectedRegion: null
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select a region')
          expect(response.payload).to.contain('There is a problem')
        })
      })
    })
  })

  describe('/bill-runs/setup/{sessionId}/season', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions('season')

        Sinon.stub(SeasonService, 'go').resolves({
          pageTitle: 'Select the season',
          sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
          selectedSeason: null
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the season')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(async () => {
          options = _postOptions('season', { season: 'summer' })

          Sinon.stub(SubmitSeasonService, 'go').resolves({})
        })

        it('redirects to the "check" page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/check'
          )
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          options = _postOptions('season', { type: '' })

          Sinon.stub(SubmitSeasonService, 'go').resolves({
            error: { text: 'Select the season' },
            pageTitle: 'Select the season',
            sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
            selectedSeason: null
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the season')
          expect(response.payload).to.contain('There is a problem')
        })
      })
    })
  })

  describe('/bill-runs/setup/{sessionId}/type', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions('type')

        Sinon.stub(TypeService, 'go').resolves({
          pageTitle: 'Select the bill run type',
          sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
          selectedType: null
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the bill run type')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(async () => {
          options = _postOptions('type', { type: 'annual' })

          Sinon.stub(SubmitTypeService, 'go').resolves({})
        })

        it('redirects to select a region page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/region'
          )
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          options = _postOptions('type', { type: '' })

          Sinon.stub(SubmitTypeService, 'go').resolves({
            error: { text: 'Select the bill run type' },
            pageTitle: 'Select the bill run type',
            sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
            selectedType: null
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the bill run type')
          expect(response.payload).to.contain('There is a problem')
        })
      })
    })
  })

  describe('/bill-runs/setup/{sessionId}/year', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions('year')
      })

      describe('when the request succeeds with at least 1 year to display', () => {
        beforeEach(async () => {
          Sinon.stub(YearService, 'go').resolves({
            financialYearsData: [
              {
                text: '2023 to 2024',
                value: 2024,
                checked: false
              }
            ],
            pageTitle: 'Select the financial year',
            sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
            selectedYear: null
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the financial year')
        })
      })

      describe('when the request succeeds with no years to display', () => {
        beforeEach(async () => {
          Sinon.stub(YearService, 'go').resolves({
            financialYearsData: [],
            sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
            selectedYear: null
          })
        })

        it('redirects to the no licences endpoint', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/no-licences'
          )
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(async () => {
          options = _postOptions('year', { year: '2023' })
        })

        describe('and the bill run setup is complete', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitYearService, 'go').resolves({ setupComplete: true })
          })

          it('redirects to the "check"', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              '/system/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/check'
            )
          })
        })

        describe('and the bill run setup is not complete', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitYearService, 'go').resolves({ setupComplete: false })
          })

          it('redirects to the select season', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              '/system/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/season'
            )
          })
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          options = _postOptions('year', { year: '' })

          Sinon.stub(SubmitYearService, 'go').resolves({
            error: { text: 'Select a financial year' },
            pageTitle: 'Select the financial year',
            sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
            selectedYear: null
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select a financial year')
          expect(response.payload).to.contain('There is a problem')
        })
      })
    })
  })
})

function _getOptions(path) {
  return {
    method: 'GET',
    url: `/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/${path}`,
    auth: {
      strategy: 'session',
      credentials: { scope: ['billing'] }
    }
  }
}

function _postOptions(path, payload) {
  return postRequestOptions(`/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/${path}`, payload)
}
