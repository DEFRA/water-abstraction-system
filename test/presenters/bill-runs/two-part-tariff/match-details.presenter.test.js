'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it } = require('node:test')
const { expect } = Code

// Thing under test
const MatchDetailsPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/match-details.presenter.js')

describe('Match Details presenter', () => {
  describe('when there is data to be presented for the view match details page', () => {
    const billRun = _billRun()
    const reviewChargeElement = _reviewChargeElementData()
    const licenceId = '5aa8e752-1a5c-4b01-9112-d92a543b70d1'

    it('correctly presents the data', async () => {
      const result = MatchDetailsPresenter.go(billRun, reviewChargeElement, licenceId)

      expect(result).to.equal({
        billRunId: '6620135b-0ecf-4fd4-924e-371f950c0526',
        financialYear: '2022 to 2023',
        chargePeriod: '1 April 2022 to 5 June 2022',
        licenceId: '5aa8e752-1a5c-4b01-9112-d92a543b70d1',
        chargeElement: {
          chargeElementId: 'b4d70c89-de1b-4f68-a47f-832b338ac044',
          description: 'Trickle Irrigation - Direct',
          dates: ['1 April 2022 to 5 June 2022'],
          status: 'ready',
          billableVolume: 0,
          authorisedVolume: 200,
          issues: []
        },
        matchedReturns: [
          {
            returnId: 'v1:1:01/57/14/1646:15584914:2022-04-01:2023-03-31',
            reference: '10031343',
            dates: '1 April 2022 to 6 May 2022',
            purpose: 'Spray Irrigation - Direct',
            description: 'Lands at Mosshayne Farm, Exeter & Broadclyst',
            returnStatus: 'completed',
            returnTotal: '0 ML / 0 ML',
            issues: [''],
            returnLink: '/returns/return?id=v1:1:01/57/14/1646:15584914:2022-04-01:2023-03-31',
            absPeriod: '1 April to 31 March'
          }
        ]
      })
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
