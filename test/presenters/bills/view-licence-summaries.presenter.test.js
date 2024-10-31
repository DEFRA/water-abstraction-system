'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Thing under test
const ViewLicenceSummariesPresenter = require('../../../app/presenters/bills/view-licence-summaries.presenter.js')

describe('View Licence Summaries presenter', () => {
  let licenceSummaries

  describe('when provided with a populated licence summaries', () => {
    beforeEach(() => {
      licenceSummaries = _testLicenceSummaries()
    })

    it('correctly presents the data', () => {
      const result = ViewLicenceSummariesPresenter.go(licenceSummaries)

      expect(result).to.equal({
        billLicences: [
          {
            id: 'e37320ba-10c8-4954-8bc4-6982e56ded41',
            reference: '01/735',
            total: '-£6,222.18'
          },
          {
            id: '127377ea-24ea-4578-8b96-ef9a8625a313',
            reference: '01/466',
            total: '£7,066.55'
          },
          {
            id: 'af709c49-54ac-4a4f-a167-8b152c9f44fb',
            reference: '01/638',
            total: '£8,239.07'
          }
        ],
        tableCaption: '3 licences'
      })
    })

    describe('the "tableCaption" property', () => {
      describe('when there is only 1 licence summary', () => {
        let singularLicenceSummary

        beforeEach(() => {
          singularLicenceSummary = [licenceSummaries[0]]
        })

        it('returns the count and caption singular', () => {
          const result = ViewLicenceSummariesPresenter.go(singularLicenceSummary)

          expect(result.tableCaption).to.equal('1 licence')
        })
      })

      describe('when there are multiple licence summaries', () => {
        it('returns the count and caption pluralised', () => {
          const result = ViewLicenceSummariesPresenter.go(licenceSummaries)

          expect(result.tableCaption).to.equal('3 licences')
        })
      })
    })
  })
})

function _testLicenceSummaries () {
  return [
    {
      id: 'e37320ba-10c8-4954-8bc4-6982e56ded41',
      licenceRef: '01/735',
      total: -622218
    },
    {
      id: '127377ea-24ea-4578-8b96-ef9a8625a313',
      licenceRef: '01/466',
      total: 706655
    },
    {
      id: 'af709c49-54ac-4a4f-a167-8b152c9f44fb',
      licenceRef: '01/638',
      total: 823907
    }
  ]
}
