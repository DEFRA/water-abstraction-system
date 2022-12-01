'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const SupplementaryPresenter = require('../../app/presenters/supplementary.presenter.js')

describe('Supplementary presenter', () => {
  let data

  describe('when there are results', () => {
    beforeEach(() => {
      data = {
        billingPeriods: [
          { startDate: new Date(2022, 3, 1), endDate: new Date(2023, 2, 31) }
        ],
        licences: [
          { licenceId: '0000579f-0f8f-4e21-b63a-063384ad32c8', licenceRef: 'AT/SROC/SUPB/01' }
        ],
        chargeVersions: [
          {
            chargeVersionId: '4b5cbe04-a0e2-468c-909e-1e2d93810ba8',
            scheme: 'sroc',
            endDate: null,
            licenceRef: 'AT/SROC/SUPB/01',
            licenceId: '0000579f-0f8f-4e21-b63a-063384ad32c8'
          },
          {
            chargeVersionId: '732fde85-fd3b-44e8-811f-8e6f4eb8cf6f',
            scheme: 'sroc',
            endDate: null,
            licenceRef: 'AT/SROC/SUPB/01',
            licenceId: '0000579f-0f8f-4e21-b63a-063384ad32c8'
          }
        ]
      }
    })

    it('correctly presents the data', () => {
      const presenter = new SupplementaryPresenter(data)
      const result = presenter.go()

      expect(result.billingPeriods).to.have.length(1)
      expect(result.billingPeriods[0]).to.equal(data.billingPeriods[0])

      expect(result.licences).to.have.length(1)
      expect(result.licences[0]).to.equal({
        licenceId: data.chargeVersions[0].licenceId,
        licenceRef: data.chargeVersions[0].licenceRef
      })

      expect(result.chargeVersions).to.have.length(2)
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
      const presenter = new SupplementaryPresenter(data)
      const result = presenter.go()

      expect(result.billingPeriods).to.be.empty()
      expect(result.licences).to.be.empty()
      expect(result.chargeVersions).to.be.empty()
    })
  })
})
