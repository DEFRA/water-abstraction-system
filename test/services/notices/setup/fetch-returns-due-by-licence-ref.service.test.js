'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const FetchReturnsDueByLicenceRefService = require('../../../../app/services/notices/setup/fetch-returns-due-by-licence-ref.service.js')

describe('Notices - Setup - Fetch Returns Due By Licence Ref service', () => {
  let licenceRef
  let returnLog

  beforeEach(async () => {
    licenceRef = generateLicenceRef()

    returnLog = await ReturnLogHelper.add({
      licenceRef,
      metadata: {
        purposes: [
          {
            tertiary: { description: 'Potable Water Supply - Direct' }
          }
        ]
      }
    })

    // Add a record not due
    await ReturnLogHelper.add({
      licenceRef,
      status: 'void'
    })

    // Add a record due but after the endDate
    await ReturnLogHelper.add({
      licenceRef,
      endDate: '3000-01-01'
    })
  })

  describe('when called', () => {
    it('returns the "due" returns for the licence', async () => {
      const result = await FetchReturnsDueByLicenceRefService.go(licenceRef)

      expect(result).to.equal([
        {
          description: 'Potable Water Supply - Direct',
          endDate: new Date('2023-03-31'),
          returnId: returnLog.returnId,
          returnReference: returnLog.returnReference,
          startDate: new Date('2022-04-01')
        }
      ])
    })
  })
})
