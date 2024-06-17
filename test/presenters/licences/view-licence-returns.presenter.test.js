'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicenceReturnsPresenter = require('../../../app/presenters/licences/view-licence-returns.presenter.js')

describe('View Licence returns presenter', () => {
  let returnsData
  let hasRequirements

  const returnItem = {
    id: 'mock-id-1',
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
    returnReference: '1068'
  }

  beforeEach(() => {
    hasRequirements = true
    returnsData = [
      { ...returnItem },
      {
        ...returnItem,
        id: 'mock-id-2',
        status: 'due',
        returnReference: '1069'
      }
    ]
  })

  describe('when provided with returns data', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceReturnsPresenter.go(returnsData, hasRequirements)

      expect(result).to.equal({
        activeTab: 'returns',
        noReturnsMessage: null,
        returns: [
          {
            id: 'mock-id-1',
            reference: '1068',
            purpose: 'SPRAY IRRIGATION',
            dueDate: '28 November 2012',
            status: 'complete',
            dates: '2 January 2020 to 1 February 2020',
            description: 'empty description'
          },
          {
            id: 'mock-id-2',
            reference: '1069',
            purpose: 'SPRAY IRRIGATION',
            dueDate: '28 November 2012',
            status: 'overdue',
            dates: '2 January 2020 to 1 February 2020',
            description: 'empty description'
          }
        ]
      })
    })
  })

  describe('the "noReturnsMessage" property', () => {
    describe('when a licence has returns and requirements', () => {
      it('returns null', () => {
        const result = ViewLicenceReturnsPresenter.go(returnsData, hasRequirements)

        expect(result.noReturnsMessage).to.be.null()
      })
    })

    describe('when a licence has NO returns and NO requirements', () => {
      beforeEach(() => {
        returnsData = []
        hasRequirements = false
      })

      it('presents the No returns and No requirements message "No requirements for returns have been set up for this licence."', () => {
        const result = ViewLicenceReturnsPresenter.go(returnsData, hasRequirements)

        expect(result.noReturnsMessage).to.equal('No requirements for returns have been set up for this licence.')
      })
    })

    describe('when a licence has returns but no requirements', () => {
      beforeEach(() => {
        returnsData = []
      })

      it('presents the returns but no requirements message "No returns for this licence."', () => {
        const result = ViewLicenceReturnsPresenter.go(returnsData, hasRequirements)

        expect(result.noReturnsMessage).to.equal('No returns for this licence.')
      })
    })
  })
})
