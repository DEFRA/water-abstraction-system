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
        chargeVersions: [
          {
            chargeVersionId: '4b5cbe04-a0e2-468c-909e-1e2d93810ba8',
            licenceRef: 'AT/SROC/SUPB/01',
            scheme: 'sroc',
            endDate: null
          },
          {
            chargeVersionId: '732fde85-fd3b-44e8-811f-8e6f4eb8cf6f',
            licenceRef: 'AT/SROC/SUPB/01',
            scheme: 'sroc',
            endDate: null
          }
        ]
      }
    })

    it('correctly presents the data', () => {
      const presenter = new SupplementaryPresenter(data)
      const result = presenter.go()

      expect(result.chargeVersions).to.have.length(2)
      expect(result.chargeVersions[0]).to.equal(data.chargeVersions[0])
    })
  })

  describe('when there are no results', () => {
    beforeEach(() => {
      data = {
        chargeVersions: []
      }
    })

    it('correctly presents the data', () => {
      const presenter = new SupplementaryPresenter(data)
      const result = presenter.go()

      expect(result.chargeVersions).to.be.empty()
    })
  })
})
