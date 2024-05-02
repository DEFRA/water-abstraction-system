'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicenceReturnsPresenter = require('../../../app/presenters/licences/view-licence-returns.presenter')

describe('View Licence returns presenter', () => {
  let returnData
  beforeEach(() => {
    returnData = _returnData()
  })

  describe('when provided with a populated licence', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceReturnsPresenter.go(returnData)

      expect(result).to.equal({
        activeTab: 'returns',
        returnsUrl: 'return/internal',
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
            dueDate: '28 November 2019',
            status: 'OVERDUE',
            dates: '2 January 2020 to 1 February 2020',
            description: 'empty description'
          }
        ]
      })
    })
  })
})

function _returnData () {
  return [
    {
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
    },
    {
      id: 'mock-id-2',
      dueDate: '2019-11-28T00:00:00.000Z',
      status: 'due',
      startDate: '2020/01/02',
      endDate: '2020/02/01',
      metadata: {
        description: 'empty description',
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
        ]
      },
      returnReference: '1069'
    }
  ]
}
