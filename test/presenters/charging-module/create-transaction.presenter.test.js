'use strict'

const { describe, it, beforeEach } = require('@jest/globals')
const { expect } = require('@jest/globals')

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
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
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
        .modifyGraph('licence.region', (builder) => {
          builder.select([
            'regionId',
            'chargeRegionId'
          ])
        })

      transaction = await TransactionHelper.add()
      transaction.chargeCategoryCode = '4.5.6'
      transaction.section127Agreement = false
      transaction.section130Agreement = false
    })

    it('correctly presents the data', () => {
      const result = CreateTransactionPresenter.go(
        transaction,
        billingPeriod,
        invoiceAccountNumber,
        licence
      )

      expect(result.clientId).toEqual(transaction.billingTransactionId)
      expect(result.ruleset).toEqual('sroc')
      expect(result.periodStart).toEqual('01-APR-2022')
      expect(result.periodEnd).toEqual('31-MAR-2023')
      expect(result.credit).toEqual(false)
      expect(result.abatementFactor).toEqual(1)
      expect(result.adjustmentFactor).toEqual(1)
      expect(result.actualVolume).toEqual(11)
      expect(result.aggregateProportion).toEqual(1)
      expect(result.areaCode).toEqual('SAAR')
      expect(result.authorisedDays).toEqual(365)
      expect(result.authorisedVolume).toEqual(11)
      expect(result.billableDays).toEqual(365)
      expect(result.chargeCategoryCode).toEqual('4.5.6')
      expect(result.chargeCategoryDescription).toEqual('Medium loss, non-tidal, restricted water, up to and including 25 ML/yr, Tier 2 model')
      expect(result.chargePeriod).toEqual('01-APR-2022 - 31-MAR-2023')
      expect(result.compensationCharge).toEqual(false)
      expect(result.customerReference).toEqual(invoiceAccountNumber)
      expect(result.licenceNumber).toEqual(licence.licenceRef)
      expect(result.lineDescription).toEqual('Water abstraction charge: Agriculture other than spray irrigation at East Rudham')
      expect(result.loss).toEqual('medium')
      expect(result.region).toEqual(region.chargeRegionId)
      expect(result.regionalChargingArea).toEqual('Southern')
      expect(result.section127Agreement).toEqual(false)
      expect(result.section130Agreement).toEqual(false)
      expect(result.supportedSource).toEqual(false)
      expect(result.supportedSourceName).toEqual(null)
      expect(result.twoPartTariff).toEqual(false)
      expect(result.waterCompanyCharge).toEqual(false)
      expect(result.waterUndertaker).toEqual(false)
      expect(result.winterOnly).toEqual(false)
    })
  })
})
