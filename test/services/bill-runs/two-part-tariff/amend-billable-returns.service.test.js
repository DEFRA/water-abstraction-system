'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Things we need to stub
const AmendBillableReturnsPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/amend-billable-returns.presenter.js')
const FetchMatchDetailsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-match-details.service.js')

// Thing under test
const AmendBillableReturnsService = require('../../../../app/services/bill-runs/two-part-tariff/amend-billable-returns.service.js')

describe('Amend Billable Returns Service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a billRun, licence and chargeElement ID', () => {
    const reviewChargeElementId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
    const billRunId = 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e'
    const licenceId = '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2'

    beforeEach(() => {
      Sinon.stub(FetchMatchDetailsService, 'go').resolves({
        billRun: 'bill run data',
        reviewChargeElement: 'charge element details'
      })

      Sinon.stub(AmendBillableReturnsPresenter, 'go').resolves('page data')
    })

    it('will fetch the charge element data and return it once formatted by the presenter', async () => {
      const result = await AmendBillableReturnsService.go(billRunId, licenceId, reviewChargeElementId)

      expect(FetchMatchDetailsService.go.called).to.be.true()
      expect(AmendBillableReturnsPresenter.go.called).to.be.true()
      expect(result).to.equal('page data')
    })
  })
})
