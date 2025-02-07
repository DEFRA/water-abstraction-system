'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const FetchConfirmReceivedService = require('../../../../app/services/return-logs/setup/fetch-confirm-received.service.js')

describe('Return Logs Setup - Fetch Confirm Received service', () => {
  let licence
  let returnLog

  describe('when a matching return log exists', () => {
    before(async () => {
      licence = await LicenceHelper.add()

      returnLog = await ReturnLogHelper.add({
        licenceRef: licence.licenceRef,
        metadata: {
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
          description: ' STOCKLEY PARK, UXBRIDGE'
        }
      })
    })

    it('returns the related return log instance', async () => {
      const result = await FetchConfirmReceivedService.go(returnLog.id)

      expect(result).to.equal({
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        returnLogId: returnLog.id,
        returnReference: returnLog.returnReference,
        siteDescription: returnLog.metadata.description,
        purposes: returnLog.metadata.purposes
      })
    })
  })
})
