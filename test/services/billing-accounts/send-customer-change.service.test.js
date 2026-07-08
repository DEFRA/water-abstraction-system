// Test framework dependencies

// Test helpers
import ExpandedError from '../../../app/errors/expanded.error.js'

// Things we need to stub
import ChargingModuleCreateCustomerChangePresenter from '../../../app/presenters/charging-module/create-customer-change.presenter.js'
import * as ChargingModuleCreateCustomerChangeRequest from '../../../app/requests/charging-module/create-customer-change.request.js'

// Thing under test
import SendCustomerChangeService from '../../../app/services/billing-accounts/send-customer-change.service.js'

describe('Send Transactions service', () => {
  const billingAccount = { id: '3b53f101-d256-40f8-a6be-ddefb5f9647c' }

  beforeEach(() => {
    vi.mock('../../../app/presenters/charging-module/create-customer-change.presenter.js')
    ChargingModuleCreateCustomerChangePresenter.mockReturnValue({
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
    vi.restoreAllMocks()
  })

  describe('when calling the Charging Module API is successful', () => {
    beforeEach(() => {
      vi.spyOn(ChargingModuleCreateCustomerChangeRequest, 'send').mockResolvedValue({
        succeeded: true
      })
    })

    it('does not throw an error', async () => {
      await SendCustomerChangeService(billingAccount)
    })
  })

  describe('when calling the Charging Module API is unsuccessful', () => {
    beforeEach(() => {
      vi.spyOn(ChargingModuleCreateCustomerChangeRequest, 'send').mockResolvedValue({
        succeeded: false
      })
    })

    it('throws an error', async () => {
      const result = await SendCustomerChangeService(billingAccount).catch((e) => {
        return e
      })

      expect(result).toBeInstanceOf(ExpandedError)
      expect(result.message).toEqual('Customer change failed to send')
      expect(result.billingAccountId).toEqual(billingAccount.id)
    })
  })
})
