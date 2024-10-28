'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const BillingAccountModel = require('../../../app/models/billing-account.model.js')
const FetchBillService = require('../../../app/services/bills/fetch-bill-service.js')
const ViewBillPresenter = require('../../../app/presenters/bills/view-bill.presenter.js')
const ViewLicenceSummariesPresenter = require('../../../app/presenters/bills/view-licence-summaries.presenter.js')
const ViewBillLicencePresenter = require('../../../app/presenters/bill-licences/view-bill-licence.presenter.js')

// Thing under test
const ViewBillService = require('../../../app/services/bills/view-bill.service.js')

describe('View Bill service', () => {
  const testId = '64924759-8142-4a08-9d1e-1e902cd9d316'

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a bill with a matching ID exists', () => {
    describe('and it is linked to multiple licences', () => {
      beforeEach(() => {
        Sinon.stub(FetchBillService, 'go').resolves(
          {
            bill: {
              id: 'a102d2b4-d0d5-4b26-82e2-d74a66e2cdc3',
              billingAccountId: '34183769-40d8-4d23-8bbb-f28e4d00c737'
            },
            licenceSummaries: [
              { id: '82c106dd-ee90-4566-b06b-a66d9e56b4b1' },
              { id: '5bf9a7f0-c769-486d-a685-f032799e42d9' }
            ]
          }
        )

        Sinon.stub(BillingAccountModel, 'query').returns({
          findById: Sinon.stub().returnsThis(),
          modify: Sinon.stub().resolves()
        })

        Sinon.stub(ViewBillPresenter, 'go').returns({
          billingAccountId: '34183769-40d8-4d23-8bbb-f28e4d00c737'
        })

        Sinon.stub(ViewLicenceSummariesPresenter, 'go').returns(
          {
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
          }
        )
      })

      it('will fetch the data and format it using the bill and licence summaries presenters', async () => {
        const result = await ViewBillService.go(testId)

        expect(result).to.equal({
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
        Sinon.stub(FetchBillService, 'go').resolves(
          {
            bill: {
              id: 'a102d2b4-d0d5-4b26-82e2-d74a66e2cdc3',
              billingAccountId: '34183769-40d8-4d23-8bbb-f28e4d00c737'
            },
            licenceSummaries: [
              { id: '82c106dd-ee90-4566-b06b-a66d9e56b4b1' }
            ]
          }
        )

        Sinon.stub(ViewBillPresenter, 'go').returns({
          billingAccountId: '34183769-40d8-4d23-8bbb-f28e4d00c737'
        })

        Sinon.stub(ViewBillLicencePresenter, 'go').returns(
          {
            tableCaption: '2 transactions',
            transactions: [
              { chargeType: 'standard' },
              { chargeType: 'compensation' }
            ]
          }
        )
      })

      it('will fetch the data and format it using the bill and view bill licence presenters', async () => {
        const result = await ViewBillService.go(testId)

        expect(result).to.equal({
          billingAccountId: '34183769-40d8-4d23-8bbb-f28e4d00c737',
          tableCaption: '2 transactions',
          transactions: [
            { chargeType: 'standard' },
            { chargeType: 'compensation' }
          ]
        })
      })
    })
  })

  describe('when a bill with a matching ID does not exist', () => {
    beforeEach(() => {
      Sinon.stub(FetchBillService, 'go').resolves(
        {
          bill: undefined,
          licenceSummaries: []
        }
      )

      Sinon.stub(BillingAccountModel, 'query').returns({
        findById: Sinon.stub().returnsThis(),
        modify: Sinon.stub().resolves(undefined)
      })
    })

    it('throws an exception', async () => {
      await expect(ViewBillService.go('testId'))
        .to
        .reject()
    })
  })
})
