'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const Boom = require('@hapi/boom')
const CreateService = require('../../app/services/bill-runs/setup/create.service.js')
const ExistsService = require('../../app/services/bill-runs/setup/exists.service.js')
const InitiateSessionService = require('../../app/services/bill-runs/setup/initiate-session.service.js')
const NoLicencesService = require('../../app/services/bill-runs/setup/no-licences.service.js')
const RegionService = require('../../app/services/bill-runs/setup/region.service.js')
const SeasonService = require('../../app/services/bill-runs/setup/season.service.js')
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

  describe('/bill-runs/setup/{sessionId}/create', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions('create')
      })

      describe('when the request succeeds', () => {
        describe('but there is an existing bill run', () => {
          beforeEach(() => {
            Sinon.stub(ExistsService, 'go').resolves({
              matchResults: [{ id: '81e97369-e744-44c9-ad2e-75e8e632e61c' }],
              pageData: {
                billRunId: '81e97369-e744-44c9-ad2e-75e8e632e61c',
                billRunLink: '/system/bill-runs/81e97369-e744-44c9-ad2e-75e8e632e61c'
              },
              session: { id: 'e009b394-8405-4358-86af-1a9eb31298a5' },
              yearToUse: 2024
            })
          })

          it('returns the "create" page displaying the existing bill run', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('This bill run already exists')
            expect(response.payload).to.contain('81e97369-e744-44c9-ad2e-75e8e632e61c')
          })
        })

        describe('and there is no existing bill run', () => {
          beforeEach(() => {
            Sinon.stub(ExistsService, 'go').resolves({
              matchResults: [],
              pageData: null,
              session: { id: 'e009b394-8405-4358-86af-1a9eb31298a5' },
              yearToUse: 2024
            })
            Sinon.stub(CreateService, 'go').resolves()
          })

          it('redirects to the bill runs page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/bill-runs')
          })
        })
      })

      describe('when the request fails', () => {
        describe('because the create service threw an error', () => {
          beforeEach(async () => {
            Sinon.stub(Boom, 'badImplementation').returns(new Boom.Boom('Bang', { statusCode: 500 }))
            Sinon.stub(ExistsService, 'go').resolves({
              matchResults: [],
              pageData: null,
              session: { id: 'e009b394-8405-4358-86af-1a9eb31298a5' },
              yearToUse: 2024
            })
            Sinon.stub(CreateService, 'go').rejects()
          })

          it('returns the error page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Sorry, there is a problem with the service')
          })
        })
      })
    })
  })

  describe('/bill-runs/setup/{sessionId}/no-licences', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions('no-licences')

        Sinon.stub(NoLicencesService, 'go').resolves('Test')
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
          sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
          regions: [
            { id: 'e21b987c-7a5f-4eb3-a794-e4aae4a96a28', displayName: 'Riverlands' },
            { id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'Stormlands' }
          ],
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

          it('redirects to the create bill run endpoint', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              '/system/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/create'
            )
          })
        })

        describe('and the bill run setup is not complete', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitRegionService, 'go').resolves({ setupComplete: false })
          })

          it('redirects to the select financial year', async () => {
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
            sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
            regions: [{ id: 'e21b987c-7a5f-4eb3-a794-e4aae4a96a28', displayName: 'Riverlands' }],
            selectedRegion: null,
            error: { text: 'Select a region' }
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

        it('redirects to the create bill run endpoint', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/create'
          )
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          options = _postOptions('season', { type: '' })

          Sinon.stub(SubmitSeasonService, 'go').resolves({
            sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
            selectedSeason: null,
            error: { text: 'Select the season' }
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
          sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
          selectedType: null
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select bill run type')
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
            sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
            selectedType: null,
            error: { text: 'Select a bill run type' }
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select a bill run type')
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

          it('redirects to the create bill run endpoint', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal(
              '/system/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/create'
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

        describe('and the bill run type is two-part tariff supplementary', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitYearService, 'go').resolves({ goBackToBillRuns: true })
          })

          it('redirects to the bill runs page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/bill-runs')
          })
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          options = _postOptions('year', { year: '' })

          Sinon.stub(SubmitYearService, 'go').resolves({
            sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
            selectedYear: null,
            error: { text: 'Select a financial year' }
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
