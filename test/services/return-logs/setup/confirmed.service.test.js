'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchReturnLogService = require('../../../../app/services/return-logs/setup/fetch-return-log.service.js')

// Thing under test
const ConfirmedService = require('../../../../app/services/return-logs/setup/confirmed.service.js')

describe('Return Logs - Setup - Confirmed service', () => {
  const returnId = 'e8d145d9-2da4-4d2d-b338-92cedc7cea7f'

  beforeEach(() => {
    Sinon.stub(FetchReturnLogService, 'go').resolves({
      licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
      licenceRef: '01/117',
      returnId,
      returnReference: '10032788',
      purposes: [
        {
          alias: 'SPRAY IRRIGATION',
          primary: {
            code: 'I',
            description: 'Industrial, Commercial And Public Services'
          },
          tertiary: {
            code: '400',
            description: 'Spray Irrigation - Direct'
          },
          secondary: {
            code: 'GOF',
            description: 'Golf Courses'
          }
        }
      ],
      siteDescription: 'Addington Sandpits',
      status: 'received'
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ConfirmedService.go(returnId)

      expect(result).to.equal({
        activeNavBar: 'search',
        licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
        licenceRef: '01/117',
        pageTitle: 'Return 10032788 received',
        purposeDetails: {
          label: 'Purpose',
          value: 'Spray Irrigation - Direct'
        },
        returnId: 'e8d145d9-2da4-4d2d-b338-92cedc7cea7f',
        siteDescription: 'Addington Sandpits',
        status: 'received'
      })
    })
  })
})
