'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchViewMatchDetailsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-view-match-details.service.js')
const ViewMatchDetailsPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/view-match-details.presenter.js')

// Thing under test
const ViewMatchDetailsService = require('../../../../app/services/bill-runs/two-part-tariff/view-match-details.service.js')

describe('View Match Details Service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a billRun, licence and chargeElement ID', () => {
    const reviewChargeElementId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
    const billRunId = 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e'
    const licenceId = '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2'

    beforeEach(() => {
      Sinon.stub(FetchViewMatchDetailsService, 'go').resolves({
        billRun: 'bill run data',
        reviewChargeElement: 'charge element details'
      })

      Sinon.stub(ViewMatchDetailsPresenter, 'go').resolves('page data')
    })

    it('will fetch the charge element data and return it once formatted by the presenter', async () => {
      const result = await ViewMatchDetailsService.go(billRunId, licenceId, reviewChargeElementId)

      expect(FetchViewMatchDetailsService.go.called).to.be.true()
      expect(ViewMatchDetailsPresenter.go.called).to.be.true()
      expect(result).to.equal('page data')
    })
  })
})
