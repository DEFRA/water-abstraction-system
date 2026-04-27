'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchOtherPurposeIdsDal = require('../../../../../app/dal/return-versions/fetch-other-purpose-ids.dal.js')

// Thing under test
const GenerateReturnVersionRequirementsService = require('../../../../../app/services/return-versions/setup/check/generate-return-version-requirements.service.js')

describe('Return Versions - Setup - Generate Return Version Requirements service', () => {
  let fetchOtherPurposeIdsStub
  let licenceId
  let sessionRequirements

  beforeEach(async () => {
    licenceId = '7cf4a46b-1375-42c8-bfe7-24c1bfff765c'

    sessionRequirements = [
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
      },
      // Invalid 1 - a return requirement because user clicked 'Add', but then immediately hit back
      {},
      {
        points: ['30070341-ef94-4df8-87dd-31d51a046b8b', '916a1320-0f57-43b2-bddc-b609218abf1c'],
        purposes: [
          {
            id: 'ff7cecd5-96ef-4625-b232-54ef7e50ab8e',
            alias: ''
          },
          {
            id: '58855070-25d1-4f17-92e5-2a67721a4434',
            alias: 'This is the second purpose test alias'
          }
        ],
        returnsCycle: 'summer',
        siteDescription: 'Site Number Two',
        // NOTE: When abstraction periods are manually entered they are saved in the session as strings rather than integers
        // The ORM isn't fussy and correctly converts the strings to integers when writing the data to the database
        abstractionPeriod: {
          abstractionPeriodEndDay: '31',
          abstractionPeriodEndMonth: '8',
          abstractionPeriodStartDay: '1',
          abstractionPeriodStartMonth: '6'
        },
        frequencyReported: 'day',
        frequencyCollected: 'day',
        agreementsExceptions: [
          'gravity-fill',
          'transfer-re-abstraction-scheme',
          'two-part-tariff',
          '56-returns-exception'
        ]
      },
      // Invalid 2 - a return requirement because user clicked 'Add', but then clicked back from the 'Enter abstraction'
      // page
      {
        purposes: [
          {
            id: 'ff7cecd5-96ef-4625-b232-54ef7e50ab8e',
            alias: ''
          }
        ],
        points: ['796f83bb-d50d-446f-bc47-28daff6bcb78']
      }
    ]

    fetchOtherPurposeIdsStub = Sinon.stub(FetchOtherPurposeIdsDal, 'go')
      .onFirstCall()
      .resolves({
        primaryPurposeId: 'c6fd4b2a-82b5-42b0-a98a-087ba52f9a4f',
        secondaryPurposeId: '0a80d135-9bd4-40ec-90ff-f4a365ccac3f'
      })
      .onSecondCall()
      .resolves({
        primaryPurposeId: 'c6fd4b2a-82b5-42b0-a98a-087ba52f9a4f',
        secondaryPurposeId: '0a80d135-9bd4-40ec-90ff-f4a365ccac3f'
      })
      .onThirdCall()
      .resolves({
        primaryPurposeId: '6f1bb87e-02f6-4cfb-87cb-57dc2af3e2af',
        secondaryPurposeId: '8391fe23-a85e-4e7e-a0f8-d819be97d789'
      })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('generates return requirements for persisting from the session requirements data', async () => {
      const results = await GenerateReturnVersionRequirementsService.go(licenceId, sessionRequirements)

      // We expect two return requirements to be generated from our session data
      expect(results).to.have.length(2)
      expect(results).to.equal([
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
        },
        {
          abstractionPeriodStartDay: '1',
          abstractionPeriodStartMonth: '6',
          abstractionPeriodEndDay: '31',
          abstractionPeriodEndMonth: '8',
          collectionFrequency: 'day',
          fiftySixException: true,
          gravityFill: true,
          points: ['30070341-ef94-4df8-87dd-31d51a046b8b', '916a1320-0f57-43b2-bddc-b609218abf1c'],
          reabstraction: true,
          reportingFrequency: 'day',
          returnsFrequency: 'year',
          returnRequirementPurposes: [
            {
              alias: null,
              primaryPurposeId: 'c6fd4b2a-82b5-42b0-a98a-087ba52f9a4f',
              purposeId: 'ff7cecd5-96ef-4625-b232-54ef7e50ab8e',
              secondaryPurposeId: '0a80d135-9bd4-40ec-90ff-f4a365ccac3f'
            },
            {
              alias: 'This is the second purpose test alias',
              primaryPurposeId: '6f1bb87e-02f6-4cfb-87cb-57dc2af3e2af',
              purposeId: '58855070-25d1-4f17-92e5-2a67721a4434',
              secondaryPurposeId: '8391fe23-a85e-4e7e-a0f8-d819be97d789'
            }
          ],
          siteDescription: 'Site Number Two',
          summer: true,
          twoPartTariff: true
        }
      ])

      // Because the two session data requirements share the same purpose, but the second has an additional one, we
      // expect the FetchOtherPurposeIdsService to be called three times - once for each 'valid' purpose
      expect(fetchOtherPurposeIdsStub.callCount).to.equal(3)
      expect(fetchOtherPurposeIdsStub.getCall(0).args).to.equal([licenceId, 'ff7cecd5-96ef-4625-b232-54ef7e50ab8e'])
      expect(fetchOtherPurposeIdsStub.getCall(1).args).to.equal([licenceId, 'ff7cecd5-96ef-4625-b232-54ef7e50ab8e'])
      expect(fetchOtherPurposeIdsStub.getCall(2).args).to.equal([licenceId, '58855070-25d1-4f17-92e5-2a67721a4434'])
    })
  })
})
