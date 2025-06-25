'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../../../app/models/licence.model.js')
const LicenceVersionPurposeModel = require('../../../../../app/models/licence-version-purpose.model.js')

// Things we need to stub
const DetermineTwoPartTariffAgreementService = require('../../../../../app/services/return-versions/setup/method/determine-two-part-tariff-agreement.service.js')
const FetchAbstractionDataService = require('../../../../../app/services/return-versions/setup/method/fetch-abstraction-data.service.js')

// Thing under test
const GenerateFromAbstractionDataService = require('../../../../../app/services/return-versions/setup/method/generate-from-abstraction-data.service.js')

describe('Return Versions - Setup - Generate From Abstraction Data service', () => {
  const licenceId = 'af0e52a3-db43-4add-b388-1b2564a437c7'
  const licenceVersionId = '8e57b3c9-8656-4062-92ce-c7df34ca10bf'
  const startDate = new Date('2024-04-01')

  let abstractionData
  let twoPartTariffAgreement

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a licence ID that exists', () => {
    describe('with the abstraction data returned', () => {
      beforeEach(() => {
        abstractionData = _fetchAbstractionDataResult(licenceId)
        twoPartTariffAgreement = false

        Sinon.stub(FetchAbstractionDataService, 'go').resolves(abstractionData)
        Sinon.stub(DetermineTwoPartTariffAgreementService, 'go').resolves(twoPartTariffAgreement)
      })

      it('generates return requirements setup data', async () => {
        const result = await GenerateFromAbstractionDataService.go(licenceId, licenceVersionId, startDate)

        expect(result).to.equal([
          {
            points: ['d60b0dfe-ef2b-4bc2-a963-b74b25433127', '6c664140-f7ee-4e98-aa88-74590d3fd8fb'],
            purposes: [
              {
                alias: '',
                description: 'Heat Pump',
                id: '24939b40-a187-4bd1-9222-f552a3af6368'
              }
            ],
            returnsCycle: 'summer',
            siteDescription: 'INTAKE POINT',
            abstractionPeriod: {
              'end-abstraction-period-day': 31,
              'end-abstraction-period-month': 10,
              'start-abstraction-period-day': 1,
              'start-abstraction-period-month': 4
            },
            frequencyReported: 'day',
            frequencyCollected: 'day',
            agreementsExceptions: ['none']
          },
          {
            points: ['554cd6c5-5bfe-4133-9828-2f10aa6ac5f8'],
            purposes: [
              {
                alias: '',
                description: 'Spray Irrigation - Direct',
                id: '76c8c08c-4fef-421a-83d6-16d8000311a4'
              }
            ],
            returnsCycle: 'winter-and-all-year',
            siteDescription: 'MAIN INTAKE',
            abstractionPeriod: {
              'end-abstraction-period-day': 31,
              'end-abstraction-period-month': 12,
              'start-abstraction-period-day': 1,
              'start-abstraction-period-month': 5
            },
            frequencyReported: 'month',
            frequencyCollected: 'month',
            agreementsExceptions: ['two-part-tariff']
          },
          {
            points: ['bf6a409e-7882-4c5d-9e49-2ebae2936576'],
            purposes: [
              {
                alias: '',
                description: 'Vegetable Washing',
                id: 'e5b3b9bc-59c5-46d3-b019-5cf5467d4f0f'
              }
            ],
            returnsCycle: 'winter-and-all-year',
            siteDescription: 'SOUTH BOREHOLE',
            abstractionPeriod: {
              'end-abstraction-period-day': 31,
              'end-abstraction-period-month': 3,
              'start-abstraction-period-day': 1,
              'start-abstraction-period-month': 11
            },
            frequencyReported: 'week',
            frequencyCollected: 'week',
            agreementsExceptions: ['none']
          }
        ])
      })
    })

    describe('and the licence has a "current" two-part tariff agreement', () => {
      beforeEach(() => {
        abstractionData = _fetchAbstractionDataResult(licenceId)
        twoPartTariffAgreement = true

        Sinon.stub(FetchAbstractionDataService, 'go').resolves(abstractionData)
        Sinon.stub(DetermineTwoPartTariffAgreementService, 'go').resolves(twoPartTariffAgreement)
      })

      it('sets the collection frequency to "day" for the two-part tariff spray purpose', async () => {
        const result = await GenerateFromAbstractionDataService.go(licenceId, licenceVersionId, startDate)

        // We assert the others haven't changed because of this
        expect(result[0].frequencyCollected).to.equal('day')
        expect(result[2].frequencyCollected).to.equal('week')

        // We then assert that the 3rd requirement (2nd after being sorted in results) has changed because of this
        expect(result[1].frequencyCollected).to.equal('day')
      })
    })

    describe('and the licence has a "current" purpose that is two-part tariff', () => {
      beforeEach(() => {
        abstractionData = _fetchAbstractionDataResult(licenceId)
        // The 3rd licence version purpose is already linked to a two-part tariff purpose. We set the second to be true
        // as well just to emphasise this is what is driving the logic in the service.
        abstractionData.licenceVersions[0].licenceVersionPurposes[1].purpose.twoPartTariff = true
        twoPartTariffAgreement = false

        Sinon.stub(FetchAbstractionDataService, 'go').resolves(abstractionData)
        Sinon.stub(DetermineTwoPartTariffAgreementService, 'go').resolves(twoPartTariffAgreement)
      })

      it('sets the agreements for each return requirement to be "two-part tariff"', async () => {
        const result = await GenerateFromAbstractionDataService.go(licenceId, licenceVersionId, startDate)

        expect(result[0].agreementsExceptions).to.equal(['none'])
        expect(result[1].agreementsExceptions).to.equal(['two-part-tariff'])
        expect(result[2].agreementsExceptions).to.equal(['two-part-tariff'])
      })
    })

    describe('and the licensee is a "water undertaker"', () => {
      beforeEach(() => {
        abstractionData = _fetchAbstractionDataResult(licenceId)
        abstractionData.waterUndertaker = true
        twoPartTariffAgreement = false

        Sinon.stub(FetchAbstractionDataService, 'go').resolves(abstractionData)
        Sinon.stub(DetermineTwoPartTariffAgreementService, 'go').resolves(twoPartTariffAgreement)
      })

      it('sets the collection and reporting frequencies to "day"', async () => {
        const result = await GenerateFromAbstractionDataService.go(licenceId, licenceVersionId, startDate)

        expect(result[0].frequencyCollected).to.equal('day')
        expect(result[0].frequencyReported).to.equal('day')
        expect(result[1].frequencyCollected).to.equal('day')
        expect(result[1].frequencyReported).to.equal('day')
        expect(result[2].frequencyCollected).to.equal('day')
        expect(result[2].frequencyReported).to.equal('day')
      })
    })
  })

  describe('when called with a licence ID that does not exists', () => {
    it('throws an error', async () => {
      await expect(GenerateFromAbstractionDataService.go('fc29a098-c1ab-4a2b-bc31-b713cccc505d', startDate)).to.reject()
    })
  })
})

function _fetchAbstractionDataResult(licenceId) {
  return LicenceModel.fromJson({
    id: licenceId,
    waterUndertaker: false,
    licenceVersions: [
      {
        id: 'f7a5ba6a-ceaa-41e9-a8b5-27f33f42d05e',
        startDate: new Date('2022-05-01'),
        status: 'current',
        licenceVersionPurposes: [
          // NOTE: We specifically create a model from JSON rather than just passing in the JSON directly because the
          // service needs to be able to call the model instances $electricityGeneration() method
          LicenceVersionPurposeModel.fromJson({
            id: '3f140d82-bdfa-46cc-bfeb-920e7188f571',
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 10,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            dailyQuantity: 455,
            externalId: '1:10065380',
            primaryPurpose: { id: 'd7c327ce-246d-4370-a6fe-1f2c6ba7a22a', legacyId: 'P' },
            purpose: {
              id: '24939b40-a187-4bd1-9222-f552a3af6368',
              description: 'Heat Pump',
              legacyId: '200',
              twoPartTariff: false
            },
            secondaryPurpose: { id: '235ed780-f535-4b8d-b367-b5438ac130e9', legacyId: 'ELC' },
            points: [
              { description: 'INTAKE POINT', id: 'd60b0dfe-ef2b-4bc2-a963-b74b25433127' },
              { description: 'OUT TAKE POINT', id: '6c664140-f7ee-4e98-aa88-74590d3fd8fb' }
            ]
          }),
          LicenceVersionPurposeModel.fromJson({
            id: 'c7a77631-4a85-4d7a-9aa7-e79aa66fbae5',
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 11,
            dailyQuantity: 2675,
            externalId: '1:10065381',
            primaryPurpose: { id: 'd780c2a1-aad4-485c-90d8-47496ba2277e', legacyId: 'A' },
            purpose: {
              id: 'e5b3b9bc-59c5-46d3-b019-5cf5467d4f0f',
              description: 'Vegetable Washing',
              legacyId: '460',
              twoPartTariff: false
            },
            secondaryPurpose: { id: '827f5181-1acc-452a-aea3-a1d72a21604b', legacyId: 'AGR' },
            points: [{ description: 'SOUTH BOREHOLE', id: 'bf6a409e-7882-4c5d-9e49-2ebae2936576' }]
          }),
          LicenceVersionPurposeModel.fromJson({
            id: '1255bf65-fcfd-4b28-a48a-b8ec2e7820b0',
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 12,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 5,
            dailyQuantity: 300,
            externalId: '1:10065382',
            primaryPurpose: { id: 'd780c2a1-aad4-485c-90d8-47496ba2277e', legacyId: 'A' },
            purpose: {
              id: '76c8c08c-4fef-421a-83d6-16d8000311a4',
              description: 'Spray Irrigation - Direct',
              legacyId: '400',
              twoPartTariff: true
            },
            secondaryPurpose: { id: '827f5181-1acc-452a-aea3-a1d72a21604b', legacyId: 'AGR' },
            points: [{ description: 'MAIN INTAKE', id: '554cd6c5-5bfe-4133-9828-2f10aa6ac5f8' }]
          })
        ]
      }
    ]
  })
}
