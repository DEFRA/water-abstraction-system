'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingChargeCategoryHelper = require('../../support/helpers/water/billing-charge-category.helper.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const FormatSrocTransactionLineservice = require('../../../app/services/supplementary-billing/format-sroc-transaction-line.service.js')

describe.only('Format Sroc Transaction Line service', () => {
  afterEach(() => {
    Sinon.restore()
    DatabaseHelper.clean()
  })

  describe('when a standard charge element is supplied', () => {
    let eagerChargeElement
    let chargePeriod

    before(async () => {
      const { billingChargeCategoryId } = await BillingChargeCategoryHelper.add()

      const chargeElement = await ChargeElementHelper.add({ billingChargeCategoryId })
      eagerChargeElement = await chargeElement.$query()
        .withGraphFetched('billingChargeCategory')
        .withGraphFetched('chargePurposes')

      chargePeriod = {
        startDate: new Date(),
        endDate: new Date()
      }
    })

    it('returns the expected data', () => {
      const result = FormatSrocTransactionLineservice.go(eagerChargeElement, chargePeriod)

      expect(result.scheme).to.equal('sroc')
    })
  })
})
