'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const FetchReturnLogService = require('../../../../app/services/return-logs/setup/fetch-return-log.service.js')

describe('Return Logs - Setup - Fetch Return Log service', () => {
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

    it('returns the return log instance', async () => {
      const result = await FetchReturnLogService.go(returnLog.id)

      expect(result).to.equal({
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        returnLogId: returnLog.id,
        returnReference: returnLog.returnReference,
        purposes: returnLog.metadata.purposes,
        siteDescription: returnLog.metadata.description,
        status: returnLog.status
      })
    })
  })

  describe('when a matching return log does not exist', () => {
    it('returns undefined', async () => {
      const result = await FetchReturnLogService.go(generateUUID())

      expect(result).to.be.undefined()
    })
  })
})
