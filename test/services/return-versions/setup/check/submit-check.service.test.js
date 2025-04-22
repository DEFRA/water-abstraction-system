'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Things we need to stub
const FetchPointsService = require('../../../../../app/services/return-versions/setup/fetch-points.service.js')
const GenerateReturnVersionService = require('../../../../../app/services/return-versions/setup/check/generate-return-version.service.js')
const PersistReturnVersionService = require('../../../../../app/services/return-versions/setup/check/persist-return-version.service.js')
const ProcessLicenceReturnLogsService = require('../../../../../app/services/return-logs/process-licence-return-logs.service.js')
const VoidNoReturnRequiredLicenceReturnLogsService = require('../../../../../app/services/return-logs/void-return-logs.service.js')

// Thing under test
const SubmitCheckService = require('../../../../../app/services/return-versions/setup/check/submit-check.service.js')

describe('Return Versions Setup - Submit Check service', () => {
  let session

  describe('Return Versions Setup - return-required', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: {
          checkPageVisited: false,
          licence: {
            id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            currentVersionStartDate: '2023-01-01T00:00:00.000Z',
            endDate: null,
            licenceRef: '01/ABC',
            licenceHolder: 'Turbo Kid',
            returnVersions: [],
            startDate: '2022-04-01T00:00:00.000Z'
          },
          journey: 'returns-required',
          requirements: [{}],
          startDateOptions: 'licenceStartDate',
          reason: 'major-change'
        }
      })

      Sinon.stub(GenerateReturnVersionService, 'go').resolves({
        returnVersion: {
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          startDate: '2022-04-01T00:00:00.000Z'
        }
      })
      Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()
      Sinon.stub(PersistReturnVersionService, 'go').resolves()
    })

    afterEach(() => {
      Sinon.restore()
    })

    describe('When called with a licence that has not ended', () => {
      it('returns a valid licence', async () => {
        const result = await SubmitCheckService.go(session.id)

        expect(result).to.equal({ licenceId: session.data.licence.id })
      })
    })

    describe('When called with an licence that has ended (expired, lapsed or revoked)', () => {
      it('returns a valid licence', async () => {
        const result = await SubmitCheckService.go(session.id)

        expect(result).to.equal({ licenceId: session.data.licence.id })
      })
    })

    describe('When called with a return version marked quarterly return submissions', () => {
      describe('and requirements have a return cycle of summer', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({
            data: {
              checkPageVisited: false,
              licence: {
                id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
                currentVersionStartDate: '2023-01-01T00:00:00.000Z',
                endDate: null,
                licenceRef: '01/ABC',
                licenceHolder: 'Turbo Kid',
                returnVersions: [],
                startDate: '2022-04-01T00:00:00.000Z'
              },
              journey: 'returns-required',
              requirements: [
                {
                  returnsCycle: 'summer'
                },
                {
                  returnsCycle: 'winter_and_all_year'
                }
              ],
              startDateOptions: 'licenceStartDate',
              reason: 'major-change',
              quarterlyReturns: true
            }
          })

          Sinon.stub(FetchPointsService, 'go').resolves()
        })

        it('returns the page data needed to reload the check page and the error message', async () => {
          const result = await SubmitCheckService.go(session.id)

          expect(result).to.equal({
            activeNavBar: 'search',
            error: {
              text: "Quarterly returns submissions can't be set for returns in the summer cycle"
            },
            licenceRef: '01/ABC',
            multipleUpload: undefined,
            note: {
              actions: [
                {
                  href: 'note',
                  text: 'Add a note'
                }
              ],
              text: 'No notes added'
            },
            pageTitle: 'Check the requirements for returns for Turbo Kid',
            quarterlyReturnSubmissions: false,
            quarterlyReturns: true,
            reason: 'Major change',
            reasonLink: `/system/return-versions/setup/${session.id}/reason`,
            requirements: [],
            returnsRequired: true,
            sessionId: session.id,
            startDate: 'Invalid Date'
          })
        })
      })

      describe('and requirements do not have a return cycle of summer', () => {
        before(async () => {
          session = await SessionHelper.add({
            data: {
              checkPageVisited: false,
              licence: {
                id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
                currentVersionStartDate: '2023-01-01T00:00:00.000Z',
                endDate: null,
                licenceRef: '01/ABC',
                licenceHolder: 'Turbo Kid',
                returnVersions: [],
                startDate: '2022-04-01T00:00:00.000Z'
              },
              journey: 'returns-required',
              requirements: [
                {
                  returnsCycle: 'winter_and_all_year'
                }
              ],
              startDateOptions: 'licenceStartDate',
              reason: 'major-change',
              quarterlyReturns: true
            }
          })

          Sinon.stub(FetchPointsService, 'go').resolves()
        })

        it('returns a valid licence', async () => {
          const result = await SubmitCheckService.go(session.id)

          expect(result).to.equal({ licenceId: session.data.licence.id })
        })
      })
    })
  })

  describe('Return Versions Setup - no-return-required', () => {
    describe('When called with an no returns required version', () => {
      before(async () => {
        session = await SessionHelper.add({
          data: {
            checkPageVisited: false,
            licence: {
              id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
              currentVersionStartDate: '2023-01-01T00:00:00.000Z',
              endDate: null,
              licenceRef: '01/ABC',
              licenceHolder: 'Turbo Kid',
              returnVersions: [],
              startDate: '2022-04-01T00:00:00.000Z'
            },
            journey: 'no-returns-required',
            requirements: [{}],
            startDateOptions: 'licenceStartDate',
            reason: 'major-change'
          }
        })

        Sinon.stub(GenerateReturnVersionService, 'go').resolves({
          returnVersion: {
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            startDate: '2022-04-01T00:00:00.000Z'
          }
        })
        Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()
        Sinon.stub(PersistReturnVersionService, 'go').resolves('8b7f78ba-f3ad-4cb6-a058-78abc4d1383d')
        Sinon.stub(VoidNoReturnRequiredLicenceReturnLogsService, 'go').resolves()
      })

      it('returns a valid licence', async () => {
        const result = await SubmitCheckService.go(session.id)

        expect(result).to.equal({ licenceId: session.data.licence.id })
      })
    })
  })
})
