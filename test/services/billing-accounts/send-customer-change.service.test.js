'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const ExpandedError = require('../../../app/errors/expanded.error.js')

// Things we need to stub
const ChargingModuleCreateCustomerChangePresenter = require('../../../app/presenters/charging-module/create-customer-change.presenter.js')
const ChargingModuleCreateCustomerChangeRequest = require('../../../app/requests/charging-module/create-customer-change.request.js')

// Thing under test
const SendCustomerChangeService = require('../../../app/services/billing-accounts/send-customer-change.service.js')

describe('Send Transactions service', () => {
  const billingAccount = { id: '3b53f101-d256-40f8-a6be-ddefb5f9647c' }

  beforeEach(() => {
    Sinon.stub(ChargingModuleCreateCustomerChangePresenter, 'go').returns({
      region: 'B',
      customerReference: 'B19120000A',
      customerName: 'Mr W Aston',
      addressLine1: 'Park Farm',
      addressLine2: 'Sugar Lane',
      addressLine3: 'West Waterford',
      addressLine4: 'Angleton',
      addressLine5: 'Southampton',
      addressLine6: 'Hampshire',
      postcode: 'SO74 3KD'
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when calling the Charging Module API is successful', () => {
    beforeEach(() => {
      Sinon.stub(ChargingModuleCreateCustomerChangeRequest, 'send').resolves({
        succeeded: true
      })
    })

    it('does not throw an error', async () => {
      await SendCustomerChangeService.go(billingAccount)
    })
  })

  describe('when calling the Charging Module API is unsuccessful', () => {
    beforeEach(() => {
      Sinon.stub(ChargingModuleCreateCustomerChangeRequest, 'send').resolves({
        succeeded: false
      })
    })

    it('throws an error', async () => {
      const result = await SendCustomerChangeService.go(billingAccount).catch((e) => {
        return e
      })

      expect(result).toBeInstanceOf(ExpandedError)
      expect(result.message).toEqual('Customer change failed to send')
      expect(result.billingAccountId).toEqual(billingAccount.id)
    })
  })
})
