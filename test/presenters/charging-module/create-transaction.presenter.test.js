'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const { ref } = require('objection')
const RegionHelper = require('../../support/helpers/region.helper.js')
const TransactionHelper = require('../../support/helpers/transaction.helper.js')

// Thing under test
const CreateTransactionPresenter = require('../../../app/presenters/charging-module/create-transaction.presenter.js')

describe('Charging Module Create Transaction presenter', () => {
  const accountNumber = 'A51542397A'

  let transaction
  let licence
  let region

  describe('when provided with a Transaction and Licence instance', () => {
    beforeEach(async () => {
      region = RegionHelper.select()

      // NOTE: In the context the presenter is used it is from a Licence instance returned by
      // FetchChargeVersionsService. We recreate how that instance is formed here, including extracting some of the
      // values as distinct properties from the licence's `regions` JSONb field.
      const tempLicence = await LicenceHelper.add({
        regionId: region.id,
        regions: { historicalAreaCode: 'SAAR', regionalChargeArea: 'Southern' }
      })

      licence = await LicenceModel.query()
        .findById(tempLicence.id)
        .select([
          'id',
          'licenceRef',
          ref('licences.regions:historicalAreaCode').castText().as('historicalAreaCode'),
          ref('licences.regions:regionalChargeArea').castText().as('regionalChargeArea')
        ])
        .withGraphFetched('region')
        .modifyGraph('licence.region', (builder) => {
          builder.select([
            'id',
            'chargeRegionId'
          ])
        })

      // NOTE: The transaction object the presenter expects is what `FormatSrocTransactionLineService` returns rather
      // than a simple instance of `TransactionModel`. But to test the presenter, we just need to _represent_ what the
      // service returns whilst avoiding over complicating our tests with the additional setup it needs. So, we create a
      // standard transaction instance and amend some of the properties to match what FormatSrocTransactionLineService
      // does.
      transaction = await TransactionHelper.add()
      transaction.section127Agreement = false
      transaction.section130Agreement = false
      transaction.startDate = new Date('2022-04-01')
      transaction.endDate = new Date('2023-03-31')
    })

    it('correctly presents the data', () => {
      const result = CreateTransactionPresenter.go(transaction, accountNumber, licence)

      expect(result.clientId).to.equal(transaction.id)
      expect(result.ruleset).to.equal('sroc')
      expect(result.periodStart).to.equal('01-APR-2022')
      expect(result.periodEnd).to.equal('31-MAR-2023')
      expect(result.credit).to.equal(false)
      expect(result.abatementFactor).to.equal(1)
      expect(result.adjustmentFactor).to.equal(1)
      expect(result.actualVolume).to.equal(11)
      expect(result.aggregateProportion).to.equal(1)
      expect(result.areaCode).to.equal('SAAR')
      expect(result.authorisedDays).to.equal(365)
      expect(result.authorisedVolume).to.equal(11)
      expect(result.billableDays).to.equal(365)
      expect(result.chargeCategoryCode).to.equal(transaction.chargeCategoryCode)
      expect(result.chargeCategoryDescription).to.equal(transaction.chargeCategoryDescription)
      expect(result.chargePeriod).to.equal('01-APR-2022 - 31-MAR-2023')
      expect(result.compensationCharge).to.equal(false)
      expect(result.customerReference).to.equal(accountNumber)
      expect(result.licenceNumber).to.equal(licence.licenceRef)
      expect(result.lineDescription).to.equal('Water abstraction charge: Agriculture other than spray irrigation at East Rudham')
      expect(result.loss).to.equal('medium')
      expect(result.region).to.equal(region.chargeRegionId)
      expect(result.regionalChargingArea).to.equal('Southern')
      expect(result.section127Agreement).to.equal(false)
      expect(result.section130Agreement).to.equal(false)
      expect(result.supportedSource).to.equal(false)
      expect(result.supportedSourceName).to.equal(null)
      expect(result.twoPartTariff).to.equal(false)
      expect(result.waterCompanyCharge).to.equal(false)
      expect(result.waterUndertaker).to.equal(false)
      expect(result.winterOnly).to.equal(false)
    })
  })
})
