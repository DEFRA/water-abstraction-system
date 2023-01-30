'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const SupplementaryDataPresenter = require('../../../app/presenters/check/supplementary-data.presenter.js')

describe('Supplementary presenter', () => {
  let data

  describe('when there are results', () => {
    beforeEach(() => {
      data = {
        billingPeriods: [
          {
            startDate: new Date(2022, 3, 1), // 2022-04-01 - Months are zero indexed
            endDate: new Date(2023, 2, 31)
          }
        ],
        licences: [
          {
            licenceId: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
            licenceRef: 'AT/SROC/SUPB/01',
            numberOfTimesBilled: 1
          },
          {
            licenceId: '81b50b35-459a-43f0-a48a-262028a34493',
            licenceRef: 'AT/SROC/SUPB/02',
            numberOfTimesBilled: 0
          }
        ],
        chargeVersions: [
          {
            chargeVersionId: '6a472535-145c-4170-ab59-f555783fa6e7',
            scheme: 'sroc',
            startDate: new Date(2022, 4, 1),
            endDate: null,
            licence: {
              licenceId: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
              licenceRef: 'AT/SROC/SUPB/01'
            },
            chargeElements: [
              {
                chargeElementId: '0382824f-2b17-4294-aa57-c5fe5749960f',
                chargePurposes: [
                  {
                    chargePurposeId: 'ffcb7d57-6148-4ee7-bc95-9de23c0cdc39',
                    abstractionPeriodStartDay: 1,
                    abstractionPeriodStartMonth: 4,
                    abstractionPeriodEndDay: 31,
                    abstractionPeriodEndMonth: 3
                  }
                ],
                billingChargeCategory: {
                  reference: '4.2.1'
                }
              }
            ]
          }
        ]
      }
    })

    it('correctly presents the data', () => {
      const result = SupplementaryDataPresenter.go(data)

      expect(result.billingPeriods).to.have.length(1)
      expect(result.billingPeriods[0]).to.equal(data.billingPeriods[0])

      expect(result.licences).to.have.length(2)
      expect(result.licences[0]).to.equal({
        licenceId: data.licences[0].licenceId,
        licenceRef: data.licences[0].licenceRef,
        licenceExistsInBilling: true
      })
      expect(result.licences[1]).to.equal({
        licenceId: data.licences[1].licenceId,
        licenceRef: data.licences[1].licenceRef,
        licenceExistsInBilling: false
      })

      expect(result.chargeVersions).to.have.length(1)
      expect(result.chargeVersions[0]).to.equal(data.chargeVersions[0])
    })
  })

  describe('when there are no results', () => {
    beforeEach(() => {
      data = {
        billingPeriods: [],
        licences: [],
        chargeVersions: []
      }
    })

    it('correctly presents the data', () => {
      const result = SupplementaryDataPresenter.go(data)

      expect(result.billingPeriods).to.be.empty()
      expect(result.licences).to.be.empty()
      expect(result.chargeVersions).to.be.empty()
    })
  })
})
