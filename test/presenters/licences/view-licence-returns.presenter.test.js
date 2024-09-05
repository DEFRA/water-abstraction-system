'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicenceReturnsPresenter = require('../../../app/presenters/licences/view-licence-returns.presenter.js')

describe('View Licence returns presenter', () => {
  let returnLogs
  let hasRequirements

  beforeEach(() => {
    hasRequirements = true
    returnLogs = _returnLogs()
  })

  describe('when provided with returns data', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements)

      expect(result).to.equal({
        noReturnsMessage: null,
        returns: [
          {
            dates: '2 January 2020 to 1 February 2020',
            description: 'empty description',
            dueDate: '28 November 2012',
            link: '/returns/return?id=v1:1:01/123:10046821:2020-01-02:2020-02-01',
            purpose: 'SPRAY IRRIGATION',
            reference: '10046821',
            returnLogId: 'v1:1:01/123:10046821:2020-01-02:2020-02-01',
            status: 'complete'
          },
          {
            dates: '2 January 2020 to 1 February 2020',
            description: 'empty description',
            dueDate: '28 November 2012',
            link: '/return/internal?returnId=v1:1:01/123:10046820:2020-01-02:2020-02-01',
            purpose: 'SPRAY IRRIGATION',
            reference: '10046820',
            returnLogId: 'v1:1:01/123:10046820:2020-01-02:2020-02-01',
            status: 'overdue'
          }
        ]
      })
    })
  })

  describe('the "noReturnsMessage" property', () => {
    describe('when a licence has returns and requirements', () => {
      it('returns null', () => {
        const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements)

        expect(result.noReturnsMessage).to.be.null()
      })
    })

    describe('when a licence has NO requirements and NO returns', () => {
      beforeEach(() => {
        returnLogs = []
        hasRequirements = false
      })

      it('returns the message "No requirements for returns have been set up for this licence."', () => {
        const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements)

        expect(result.noReturnsMessage).to.equal('No requirements for returns have been set up for this licence.')
      })
    })

    describe('when a licence has requirements but NO returns', () => {
      beforeEach(() => {
        returnLogs = []
      })

      it('returns the message "No returns for this licence."', () => {
        const result = ViewLicenceReturnsPresenter.go(returnLogs, hasRequirements)

        expect(result.noReturnsMessage).to.equal('No returns for this licence.')
      })
    })
  })
})

function _returnLogs () {
  const returnLog = {
    id: 'v1:1:01/123:10046821:2020-01-02:2020-02-01',
    dueDate: new Date('2012-11-28'),
    status: 'completed',
    startDate: new Date('2020/01/02'),
    endDate: new Date('2020/02/01'),
    metadata: {
      purposes: [
        {
          alias: 'SPRAY IRRIGATION',
          primary: {
            code: 'A',
            description: 'Agriculture'
          },
          tertiary: {
            code: '400',
            description: 'Spray Irrigation - Direct'
          },
          secondary: {
            code: 'AGR',
            description: 'General Agriculture'
          }
        }
      ],
      description: 'empty description'
    },
    returnReference: '10046821'
  }

  return [
    { ...returnLog },
    {
      ...returnLog,
      id: 'v1:1:01/123:10046820:2020-01-02:2020-02-01',
      status: 'due',
      returnReference: '10046820'
    }
  ]
}
