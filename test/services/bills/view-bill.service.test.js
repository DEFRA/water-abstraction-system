// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import * as ViewBillLicencePresenter from '../../../app/presenters/bill-licences/view-bill-licence.presenter.js'
import * as ViewBillPresenter from '../../../app/presenters/bills/view-bill.presenter.js'
import * as ViewLicenceSummariesPresenter from '../../../app/presenters/bills/view-licence-summaries.presenter.js'
import BillingAccountModel from '../../../app/models/billing-account.model.js'
import FetchBillService from '../../../app/services/bills/fetch-bill-service.js'

// Thing under test
import ViewBillService from '../../../app/services/bills/view-bill.service.js'

describe('View Bill service', () => {
  const testId = '64924759-8142-4a08-9d1e-1e902cd9d316'

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a bill with a matching ID exists', () => {
    describe('and it is linked to multiple licences', () => {
      beforeEach(() => {
        vi.mock('../../../app/services/bills/fetch-bill-service.js')
        FetchBillService.mockResolvedValue({
          bill: {
            id: 'a102d2b4-d0d5-4b26-82e2-d74a66e2cdc3',
            billingAccountId: '34183769-40d8-4d23-8bbb-f28e4d00c737'
          },
          licenceSummaries: [
            { id: '82c106dd-ee90-4566-b06b-a66d9e56b4b1' },
            { id: '5bf9a7f0-c769-486d-a685-f032799e42d9' }
          ]
        })

        vi.spyOn(BillingAccountModel, 'query').mockReturnValue({
          findById: vi.fn().mockReturnThis(),
          modify: vi.fn().mockResolvedValue()
        })

        vi.spyOn(ViewBillPresenter, 'default').mockReturnValue({
          billingAccountId: '34183769-40d8-4d23-8bbb-f28e4d00c737'
        })

        vi.spyOn(ViewLicenceSummariesPresenter, 'default').mockReturnValue({
          billLicences: [
            {
              id: 'e37320ba-10c8-4954-8bc4-6982e56ded41',
              reference: '01/735',
              total: '£6,222.18'
            },
            {
              id: '127377ea-24ea-4578-8b96-ef9a8625a313',
              reference: '01/466',
              total: '£7,066.55'
            }
          ],
          tableCaption: '3 licences'
        })
      })

      it('will fetch the data and format it using the bill and licence summaries presenters', async () => {
        const result = await ViewBillService(testId)

        expect(result).toEqual({
          activeNavBar: 'bill-runs',
          billingAccountId: '34183769-40d8-4d23-8bbb-f28e4d00c737',
          billLicences: [
            {
              id: 'e37320ba-10c8-4954-8bc4-6982e56ded41',
              reference: '01/735',
              total: '£6,222.18'
            },
            {
              id: '127377ea-24ea-4578-8b96-ef9a8625a313',
              reference: '01/466',
              total: '£7,066.55'
            }
          ],
          tableCaption: '3 licences'
        })
      })
    })

    describe('and it is linked to a single licence', () => {
      beforeEach(() => {
        vi.mock('../../../app/services/bills/fetch-bill-service.js')
        FetchBillService.mockResolvedValue({
          bill: {
            id: 'a102d2b4-d0d5-4b26-82e2-d74a66e2cdc3',
            billingAccountId: '34183769-40d8-4d23-8bbb-f28e4d00c737'
          },
          licenceSummaries: [{ id: '82c106dd-ee90-4566-b06b-a66d9e56b4b1' }]
        })

        vi.spyOn(ViewBillPresenter, 'default').mockReturnValue({
          billingAccountId: '34183769-40d8-4d23-8bbb-f28e4d00c737'
        })

        vi.spyOn(ViewBillLicencePresenter, 'default').mockReturnValue({
          tableCaption: '2 transactions',
          transactions: [{ chargeType: 'standard' }, { chargeType: 'compensation' }]
        })
      })

      it('will fetch the data and format it using the bill and view bill licence presenters', async () => {
        const result = await ViewBillService(testId)

        expect(result).toEqual({
          activeNavBar: 'bill-runs',
          billingAccountId: '34183769-40d8-4d23-8bbb-f28e4d00c737',
          tableCaption: '2 transactions',
          transactions: [{ chargeType: 'standard' }, { chargeType: 'compensation' }]
        })
      })
    })
  })

  describe('when a bill with a matching ID does not exist', () => {
    beforeEach(() => {
      vi.mock('../../../app/services/bills/fetch-bill-service.js')
      FetchBillService.mockResolvedValue({
        bill: undefined,
        licenceSummaries: []
      })

      vi.spyOn(BillingAccountModel, 'query').mockReturnValue({
        findById: vi.fn().mockReturnThis(),
        modify: vi.fn().mockResolvedValue(undefined)
      })
    })

    it('throws an exception', async () => {
      await expect(ViewBillService('testId')).rejects.toThrow()
    })
  })
})
