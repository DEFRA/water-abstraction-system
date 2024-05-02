'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ViewLicenceService = require('../../../app/services/licences/view-licence.service')
const FetchLicenceReturnsService = require('../../../app/services/licences/fetch-licence-returns.service')
// Thing under test
const ViewLicenceReturnsService = require('../../../app/services/licences/view-license-returns.service')

describe('View Licence service returns', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  beforeEach(() => {
    Sinon.stub(ViewLicenceService, 'go').resolves({ licenceName: 'fake license' })
    Sinon.stub(FetchLicenceReturnsService, 'go').resolves(_returnData())
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a return', () => {
    describe('and it has no optional fields', () => {
      it('will return all the mandatory data and default values for use in the licence returns page', async () => {
        const result = await ViewLicenceReturnsService.go(testId)

        expect(result).to.equal({
          activeTab: 'returns',
          licenceName: 'fake license',
          returnsUrl: 'return/internal',
          returns: [
            {
              id: 'mock-id-1',
              reference: '1068',
              purpose: 'SPRAY IRRIGATION',
              dueDate: '28 November 2012',
              status: 'COMPLETE'
            },
            {
              id: 'mock-id-2',
              reference: '1069',
              purpose: 'SPRAY IRRIGATION',
              dueDate: '28 November 2019',
              status: 'OVERDUE'
            }
          ]
        })
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
        ]
      },
      returnReference: '1068'
    },
    {
      id: 'mock-id-2',
      dueDate: '2019-11-28T00:00:00.000Z',
      status: 'due',
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
        ]
      },
      returnReference: '1069'
    }
  ]
}
