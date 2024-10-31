'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Things we need to stub
const FetchMatchDetailsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-match-details.service.js')

// Thing under test
const MatchDetailsService = require('../../../../app/services/bill-runs/two-part-tariff/match-details.service.js')

describe('Match Details Service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a billRun, licence and chargeElement ID', () => {
    const reviewChargeElementId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
    const billRunId = 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e'
    const licenceId = '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2'

    let yarStub

    beforeEach(() => {
      Sinon.stub(FetchMatchDetailsService, 'go').resolves({
        billRun: _billRun(),
        reviewChargeElement: _reviewChargeElementData()
      })

      yarStub = { flash: Sinon.stub().returns(['The billable returns for this licence have been updated']) }
    })

    it('will fetch the charge element data and return it once formatted by the presenter', async () => {
      const result = await MatchDetailsService.go(billRunId, licenceId, reviewChargeElementId, yarStub)

      expect(result.bannerMessage).to.equal('The billable returns for this licence have been updated')

      // NOTE: The service mainly just regurgitates what the MatchDetailsPresenter returns. So, we don't diligently
      // check each property of the result because we know this will have been covered by the MatchDetailsPresenter

      expect(FetchMatchDetailsService.go.called).to.be.true()
      expect(result.billRunId).to.equal('6620135b-0ecf-4fd4-924e-371f950c0526')
      expect(result.licenceId).to.equal('9a8a148d-b71e-463c-bea8-bc5e0a5d95e2')
      expect(result.chargeElement.chargeElementId).to.equal('b4d70c89-de1b-4f68-a47f-832b338ac044')
      expect(result.chargeElement.billableVolume).to.equal(0)
    })
  })
})

function _billRun () {
  return {
    id: '6620135b-0ecf-4fd4-924e-371f950c0526',
    fromFinancialYearEnding: 2023,
    toFinancialYearEnding: 2023
  }
}

function _reviewChargeElementData () {
  return {
    id: 'b4d70c89-de1b-4f68-a47f-832b338ac044',
    reviewChargeReferenceId: '9e5d87d7-073e-420e-b12d-73ca220dd8ef',
    chargeElementId: 'b345f1f1-496b-4049-a647-6bcd123dcf68',
    allocated: 10,
    amendedAllocated: 0,
    chargeDatesOverlap: false,
    issues: null,
    status: 'ready',
    createdAt: new Date('2024-04-02'),
    updatedAt: new Date('2024-04-02'),
    reviewReturns: [
      {
        id: 'c4cdbfa9-4528-4776-b62f-fa667b797717',
        reviewLicenceId: '674ffa02-51be-4caa-b25e-cc1fea1ac057',
        returnId: 'v1:1:01/57/14/1646:15584914:2022-04-01:2023-03-31',
        returnReference: '10031343',
        quantity: 0,
        allocated: 0,
        underQuery: false,
        returnStatus: 'completed',
        nilReturn: false,
        abstractionOutsidePeriod: false,
        receivedDate: new Date('2022-06-03'),
        dueDate: new Date('2022-06-03'),
        purposes: [{
          tertiary: { code: '400', description: 'Spray Irrigation - Direct' }
        }],
        description: 'Lands at Mosshayne Farm, Exeter & Broadclyst',
        startDate: new Date('2022-04-01'),
        endDate: new Date('2022-05-06'),
        issues: null,
        createdAt: new Date('2024-04-02'),
        updatedAt: new Date('2024-04-02'),
        returnLog: {
          periodEndDay: 31,
          periodEndMonth: 3,
          periodStartDay: 1,
          periodStartMonth: 4
        }
      }
    ],
    chargeElement: {
      description: 'Trickle Irrigation - Direct',
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 4,
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 3,
      authorisedAnnualQuantity: 200
    },
    reviewChargeReference: {
      id: '9e5d87d7-073e-420e-b12d-73ca220dd8ef',
      reviewChargeVersion: {
        chargePeriodStartDate: new Date('2022-04-01'),
        chargePeriodEndDate: new Date('2022-06-05')
      }
    }
  }
}
