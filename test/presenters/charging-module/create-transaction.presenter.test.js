'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')
const { ref } = require('objection')
const RegionHelper = require('../../support/helpers/water/region.helper.js')
const TransactionHelper = require('../../support/helpers/water/transaction.helper.js')

// Thing under test
const CreateTransactionPresenter = require('../../../app/presenters/charging-module/create-transaction.presenter.js')

describe('Charging Module Create Transaction presenter', () => {
  const invoiceAccountNumber = 'A51542397A'

  let transaction
  let licence
  let region

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when provided with a Transaction and Licence instance', () => {
    beforeEach(async () => {
      region = await RegionHelper.add()

      // NOTE: In the context the presenter is used it is from a Licence instance returned by
      // FetchChargeVersionsService. We recreate how that instance is formed here, including extracting some of the
      // values as distinct properties from the licence's `regions` JSONb field.
      const tempLicence = await LicenceHelper.add({
        regionId: region.regionId,
        regions: { historicalAreaCode: 'SAAR', regionalChargeArea: 'Southern' }
      })
      licence = await LicenceModel.query()
        .findById(tempLicence.licenceId)
        .select([
          'licenceId',
          'licenceRef',
          ref('licences.regions:historicalAreaCode').castText().as('historicalAreaCode'),
          ref('licences.regions:regionalChargeArea').castText().as('regionalChargeArea')
        ])
        .withGraphFetched('region')
        .modifyGraph('licence.region', builder => {
          builder.select([
            'regionId',
            'chargeRegionId'
          ])
        })

      // NOTE: The transaction object the presenter expects is what `FormatSrocTransactionLineService` returns rather
      // than a simple instance of `TransactionModel`. But to test the presenter, we just need to _represent_ what the
      // service returns whilst avoiding over complicating our tests with the additional setup it needs. So, we create a
      // standard transaction instance and amend some of the properties to match what FormatSrocTransactionLineService
      // does.
      transaction = await TransactionHelper.add()
      transaction.chargeCategoryCode = '4.5.6'
      transaction.section127Agreement = false
      transaction.section130Agreement = false
      transaction.startDate = new Date('2022-04-01')
      transaction.endDate = new Date('2023-03-31')
    })

    it('correctly presents the data', () => {
      const result = CreateTransactionPresenter.go(transaction, invoiceAccountNumber, licence)

      expect(result.clientId).to.equal(transaction.billingTransactionId)
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
      expect(result.chargeCategoryCode).to.equal('4.5.6')
      expect(result.chargeCategoryDescription).to.equal('Medium loss, non-tidal, restricted water, up to and including 25 ML/yr, Tier 2 model')
      expect(result.chargePeriod).to.equal('01-APR-2022 - 31-MAR-2023')
      expect(result.compensationCharge).to.equal(false)
      expect(result.customerReference).to.equal(invoiceAccountNumber)
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
