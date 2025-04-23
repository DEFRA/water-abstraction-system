'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')

// Thing under test
const FetchReturnsDueService = require('../../../../app/services/notices/setup/fetch-returns-due.service.js')

describe('Notices - Setup - Fetch returns due service', () => {
  const dueDate = '2024-04-28' // This needs to differ from any other returns log tests
  const isSummer = 'false'

  let licenceRefs
  let returnLog

  before(async () => {
    const defaults = ReturnLogHelper.defaults()

    returnLog = await ReturnLogHelper.add({
      dueDate,
      metadata: {
        ...defaults.metadata,
        isSummer
      }
    })

    // Add an additional returns log
    await ReturnLogHelper.add({
      dueDate,
      metadata: {
        ...defaults.metadata,
        isSummer
      }
    })

    licenceRefs = [returnLog.licenceRef]
  })

  describe('when there are licences', () => {
    it('correctly returns the matching licences', async () => {
      const result = await FetchReturnsDueService.go(licenceRefs, dueDate, isSummer)

      expect(result).to.equal([
        {
          licenceRef: returnLog.licenceRef
        }
      ])
    })
  })
})
