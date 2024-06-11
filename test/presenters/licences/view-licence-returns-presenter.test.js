'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicenceReturnsPresenter = require('../../../app/presenters/licences/view-licence-returns.presenter.js')

describe('View Licence returns presenter', () => {
  let returnData

  const returnItem = {
    id: 'mock-id-1',
    dueDate: '2012-11-28T00:00:00.000Z',
    status: 'completed',
    startDate: '2020/01/02',
    endDate: '2020/02/01',
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
    returnData = {
      returns: [
        { ...returnItem },
        {
          ...returnItem,
          id: 'mock-id-2',
          status: 'due',
          returnReference: '1069'
        }
      ]
    }
  })

  describe('when provided returns', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceReturnsPresenter.go(returnData)

      expect(result).to.equal({
        activeTab: 'returns',
        hasReturns: true,
        returns: [
          {
            id: 'mock-id-1',
            reference: '1068',
            purpose: 'SPRAY IRRIGATION',
            dueDate: '28 November 2012',
            status: 'COMPLETE',
            dates: '2 January 2020 to 1 February 2020',
            description: 'empty description'
          },
          {
            id: 'mock-id-2',
            reference: '1069',
            purpose: 'SPRAY IRRIGATION',
            dueDate: '28 November 2012',
            status: 'OVERDUE',
            dates: '2 January 2020 to 1 February 2020',
            description: 'empty description'
          }
        ]
      })
    })
  })

  describe('when no returns', () => {
    beforeEach(() => {
      returnData = {
        returns: []
      }
    })

    it('correctly returns the no returns data', () => {
      const result = ViewLicenceReturnsPresenter.go(returnData)

      expect(result).to.equal({
        activeTab: 'returns',
        hasReturns: false,
        returns: []
      })
    })
  })
})
