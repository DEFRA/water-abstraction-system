'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')

// Things we need to stub
const DetermineNextVersionNumberDal = require('../../../../../app/dal/return-versions/determine-next-version-number.dal.js')
const FetchOtherPurposeIdsDal = require('../../../../../app/dal/return-versions/fetch-other-purpose-ids.dal.js')

// Thing under test
const GenerateReturnVersionService = require('../../../../../app/services/return-versions/setup/check/generate-return-version.service.js')

describe('Return Versions - Setup - Generate Return Version service', () => {
  let licenceId
  let session
  let sessionData
  let userId

  beforeEach(() => {
    licenceId = '7cf4a46b-1375-42c8-bfe7-24c1bfff765c'
    userId = 12345

    Sinon.stub(DetermineNextVersionNumberDal, 'go').resolves(1)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called to generate a "standard" return version', () => {
    beforeEach(() => {
      sessionData = {
        checkPageVisited: true,
        journey: 'returns-required',
        licence: {
          id: licenceId,
          endDate: null,
          startDate: '1967-12-08T00:00:00.000Z',
          licenceRef: '99/99/9999',
          licenceHolder: 'A licence holder',
          returnVersions: [
            {
              id: '1b67ad84-1511-4944-834d-00814899564f',
              reason: null,
              startDate: '2023-02-13T00:00:00.000Z'
            },
            {
              id: '745886bd-b73a-41e8-819c-dfd89d44ca91',
              reason: null,
              startDate: '2008-04-01T00:00:00.000Z'
            }
          ],
          currentVersionStartDate: '2023-02-13T00:00:00.000Z'
        },
        method: 'use-existing-requirements',
        multipleUpload: false,
        quarterlyReturns: false,
        reason: 'minor-change',
        requirements: [
          {
            points: ['796f83bb-d50d-446f-bc47-28daff6bcb78'],
            purposes: [
              {
                id: 'ff7cecd5-96ef-4625-b232-54ef7e50ab8e',
                alias: ''
              }
            ],
            returnsCycle: 'winter-and-all-year',
            siteDescription: 'Site Number One',
            abstractionPeriod: {
              abstractionPeriodEndDay: '31',
              abstractionPeriodEndMonth: '3',
              abstractionPeriodStartDay: '1',
              abstractionPeriodStartMonth: '4'
            },
            frequencyReported: 'month',
            frequencyCollected: 'week',
            agreementsExceptions: ['none']
          }
        ],
        returnVersionStartDate: '2023-02-13',
        startDateOptions: 'licenceStartDate'
      }

      session = SessionModelStub.build(Sinon, sessionData)

      Sinon.stub(FetchOtherPurposeIdsDal, 'go').resolves({
        primaryPurposeId: 'c6fd4b2a-82b5-42b0-a98a-087ba52f9a4f',
        secondaryPurposeId: '0a80d135-9bd4-40ec-90ff-f4a365ccac3f'
      })
    })

    it('generates a "standard" return version for persisting from the session data', async () => {
      const result = await GenerateReturnVersionService.go(session, userId)

      expect(result).to.equal({
        returnRequirements: [
          {
            abstractionPeriodStartDay: '1',
            abstractionPeriodStartMonth: '4',
            abstractionPeriodEndDay: '31',
            abstractionPeriodEndMonth: '3',
            collectionFrequency: 'week',
            fiftySixException: false,
            gravityFill: false,
            points: ['796f83bb-d50d-446f-bc47-28daff6bcb78'],
            reabstraction: false,
            reportingFrequency: 'month',
            returnsFrequency: 'year',
            returnRequirementPurposes: [
              {
                alias: null,
                primaryPurposeId: 'c6fd4b2a-82b5-42b0-a98a-087ba52f9a4f',
                purposeId: 'ff7cecd5-96ef-4625-b232-54ef7e50ab8e',
                secondaryPurposeId: '0a80d135-9bd4-40ec-90ff-f4a365ccac3f'
              }
            ],
            siteDescription: 'Site Number One',
            summer: false,
            twoPartTariff: false
          }
        ],
        returnVersion: {
          createdBy: 12345,
          endDate: null,
          licenceId: '7cf4a46b-1375-42c8-bfe7-24c1bfff765c',
          multipleUpload: false,
          notes: undefined,
          quarterlyReturns: false,
          reason: 'minor-change',
          startDate: new Date('2023-02-13'),
          status: 'current',
          version: 1
        }
      })
    })

    describe('and the return version start date is after the 1st April 2025', () => {
      beforeEach(() => {
        sessionData.returnVersionStartDate = '2025-04-02'
      })

      describe('and the user has selected quarterly returns in the session', () => {
        beforeEach(() => {
          sessionData.quarterlyReturns = true
          session = SessionModelStub.build(Sinon, sessionData)
        })

        it('generates a return version with quarterly returns set to true', async () => {
          const result = await GenerateReturnVersionService.go(session, userId)

          expect(result.returnVersion.quarterlyReturns).to.be.true()
        })
      })

      describe('and the user has not selected quarterly returns in the session', () => {
        beforeEach(() => {
          sessionData.quarterlyReturns = false
          session = SessionModelStub.build(Sinon, sessionData)
        })

        it('generates a return version with quarterly returns set to false', async () => {
          const result = await GenerateReturnVersionService.go(session, userId)

          expect(result.returnVersion.quarterlyReturns).to.be.false()
        })
      })
    })
  })

  describe('when called to generate a "no-returns-required" return version', () => {
    beforeEach(() => {
      sessionData = {
        checkPageVisited: true,
        journey: 'no-returns-required',
        licence: {
          id: licenceId,
          endDate: null,
          startDate: '2023-02-13T00:00:00.000Z',
          licenceRef: '99/99/9999',
          licenceHolder: 'A licence holder',
          returnVersions: [],
          currentVersionStartDate: '2023-02-13T00:00:00.000Z'
        },
        multipleUpload: false,
        reason: 'returns-exception',
        requirements: [{}],
        returnVersionStartDate: '2023-02-13',
        startDateOptions: 'licenceStartDate'
      }

      session = SessionModelStub.build(Sinon, sessionData)
    })

    it('generates a "no-returns-required" return version for persisting from the session data', async () => {
      const result = await GenerateReturnVersionService.go(session, userId)

      expect(result).to.equal({
        returnRequirements: [],
        returnVersion: {
          createdBy: 12345,
          endDate: null,
          licenceId: '7cf4a46b-1375-42c8-bfe7-24c1bfff765c',
          multipleUpload: false,
          notes: undefined,
          quarterlyReturns: false,
          reason: 'returns-exception',
          startDate: new Date('2023-02-13'),
          status: 'current',
          version: 1
        }
      })
    })
  })
})
