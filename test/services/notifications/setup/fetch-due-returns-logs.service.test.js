'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')

// Thing under test
const FetchDueReturnsLogsService = require('../../../../app/services/notifications/setup/fetch-due-returns-logs.service.js')

describe('Notifications Setup - Fetch due returns logs service', () => {
  let dueDate
  let isSummer
  let licenceRefs
  let returnLog

  before(async () => {
    dueDate = '2024-04-28' // This needs to differ from any other returns log tests
    isSummer = 'false'

    returnLog = await ReturnLogHelper.add({})

    // Add an additional returns log
    await ReturnLogHelper.add({})

    dueDate = returnLog.dueDate

    licenceRefs = [returnLog.licenceRef]
  })

  describe('when there are licences', () => {
    it('correctly returns the matching licences', async () => {
      const result = await FetchDueReturnsLogsService.go(licenceRefs, dueDate, isSummer)

      expect(result).to.equal([
        {
          licenceRef: returnLog.licenceRef
        }
      ])
    })
  })
})
