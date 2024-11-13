'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchExistingRequirementsService = require('../../../../app/services/return-versions/setup/fetch-existing-requirements.service.js')

// Thing under test
const GenerateFromExistingRequirementsService = require('../../../../app/services/return-versions/setup/generate-from-existing-requirements.service.js')

describe('Return Versions Setup - Generate From Existing Requirements service', () => {
  let returnVersion

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a matching return version exists', () => {
    describe('and all its return requirements have a site description', () => {
      beforeEach(() => {
        returnVersion = _returnVersion()

        Sinon.stub(FetchExistingRequirementsService, 'go').resolves(returnVersion)
      })

      it('returns the details of its return requirements transformed for use in the journey', async () => {
        const result = await GenerateFromExistingRequirementsService.go(returnVersion.id)

        expect(result).to.equal([
          {
            points: [returnVersion.returnRequirements[0].points[0].id],
            purposes: [{
              alias: returnVersion.returnRequirements[0].returnRequirementPurposes[0].alias,
              description: 'Spray Irrigation - Storage',
              id: returnVersion.returnRequirements[0].returnRequirementPurposes[0].purposeId
            }],
            returnsCycle: 'winter-and-all-year',
            siteDescription: 'FIRST BOREHOLE AT AVALON',
            abstractionPeriod: {
              'end-abstraction-period-day': 31,
              'end-abstraction-period-month': 3,
              'start-abstraction-period-day': 1,
              'start-abstraction-period-month': 4
            },
            frequencyReported: 'week',
            frequencyCollected: 'week',
            agreementsExceptions: ['none']
          },
          {
            points: [returnVersion.returnRequirements[1].points[0].id],
            purposes: [{
              alias: '',
              description: 'Spray Irrigation - Storage',
              id: returnVersion.returnRequirements[1].returnRequirementPurposes[0].purposeId
            }],
            returnsCycle: 'summer',
            siteDescription: 'SECOND BOREHOLE AT AVALON',
            abstractionPeriod: {
              'end-abstraction-period-day': 31,
              'end-abstraction-period-month': 3,
              'start-abstraction-period-day': 1,
              'start-abstraction-period-month': 4
            },
            frequencyReported: 'month',
            frequencyCollected: 'week',
            agreementsExceptions: [
              '56-returns-exception',
              'gravity-fill',
              'transfer-re-abstraction-scheme',
              'two-part-tariff'
            ]
          }
        ])
      })
    })

    describe('but one of its return requirements does not have a site description', () => {
      beforeEach(() => {
        returnVersion = _returnVersion()
        returnVersion.returnRequirements[1].siteDescription = null

        Sinon.stub(FetchExistingRequirementsService, 'go').resolves(returnVersion)
      })

      it('returns the details of its return requirements transformed, falling back to point description for the missing site description', async () => {
        const result = await GenerateFromExistingRequirementsService.go(returnVersion.id)

        expect(result).to.equal([
          {
            points: [returnVersion.returnRequirements[0].points[0].id],
            purposes: [{
              alias: returnVersion.returnRequirements[0].returnRequirementPurposes[0].alias,
              description: 'Spray Irrigation - Storage',
              id: returnVersion.returnRequirements[0].returnRequirementPurposes[0].purposeId
            }],
            returnsCycle: 'winter-and-all-year',
            siteDescription: 'FIRST BOREHOLE AT AVALON',
            abstractionPeriod: {
              'end-abstraction-period-day': 31,
              'end-abstraction-period-month': 3,
              'start-abstraction-period-day': 1,
              'start-abstraction-period-month': 4
            },
            frequencyReported: 'week',
            frequencyCollected: 'week',
            agreementsExceptions: ['none']
          },
          {
            points: [returnVersion.returnRequirements[1].points[0].id],
            purposes: [{
              alias: '',
              description: 'Spray Irrigation - Storage',
              id: returnVersion.returnRequirements[1].returnRequirementPurposes[0].purposeId
            }],
            returnsCycle: 'summer',
            siteDescription: 'WELL AT WELLINGTON',
            abstractionPeriod: {
              'end-abstraction-period-day': 31,
              'end-abstraction-period-month': 3,
              'start-abstraction-period-day': 1,
              'start-abstraction-period-month': 4
            },
            frequencyReported: 'month',
            frequencyCollected: 'week',
            agreementsExceptions: [
              '56-returns-exception',
              'gravity-fill',
              'transfer-re-abstraction-scheme',
              'two-part-tariff'
            ]
          }
        ])
      })
    })
  })

  describe('when a matching return version does not exist', () => {
    beforeEach(() => {
      returnVersion = undefined

      Sinon.stub(FetchExistingRequirementsService, 'go').resolves(returnVersion)
    })

    it('throws an error', async () => {
      await expect(GenerateFromExistingRequirementsService.go('6d436e7b-c3c9-493c-97f3-b397c899c926')).to.reject()
    })
  })
})

function _returnVersion () {
  return {
    id: '3a591cdc-7ca0-4252-b159-6994b9319e70',
    returnRequirements: [
      {
        id: 'b8c8e40f-2557-4ce5-8fd9-fd7f6bb71c30',
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        collectionFrequency: 'week',
        fiftySixException: false,
        gravityFill: false,
        reabstraction: false,
        reportingFrequency: 'week',
        siteDescription: 'FIRST BOREHOLE AT AVALON',
        summer: false,
        twoPartTariff: false,
        points: [
          {
            id: '8be0bf17-ba9b-465f-b660-b732f0a131df',
            description: 'WELL AT WELLINGTON'
          }
        ],
        returnRequirementPurposes: [
          {
            id: 'f0709035-4f2a-4294-b4ac-dbd2c47a955f',
            alias: 'I have an alias',
            purposeId: 'da576426-70bc-4f76-b05b-849bba48a8e8',
            purpose: {
              id: 'da576426-70bc-4f76-b05b-849bba48a8e8',
              description: 'Spray Irrigation - Storage'
            }
          }
        ]
      },
      {
        id: '01674d01-f54a-4631-9fe6-76d429e2a823',
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        collectionFrequency: 'week',
        fiftySixException: true,
        gravityFill: true,
        reabstraction: true,
        reportingFrequency: 'month',
        siteDescription: 'SECOND BOREHOLE AT AVALON',
        summer: true,
        twoPartTariff: true,
        points: [
          {
            id: 'e535dfb8-3720-41aa-824d-6a6942d65650',
            description: 'WELL AT WELLINGTON'
          }
        ],
        returnRequirementPurposes: [
          {
            id: '2a6b8b21-6449-4353-8f6f-93457395f7a6',
            alias: null,
            purposeId: 'da576426-70bc-4f76-b05b-849bba48a8e8',
            purpose: {
              id: 'da576426-70bc-4f76-b05b-849bba48a8e8',
              description: 'Spray Irrigation - Storage'
            }
          }
        ]
      }
    ]
  }
}
