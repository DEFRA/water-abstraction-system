'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ModLogHelper = require('../../support/helpers/mod-log.helper.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')

// Thing under test
const FetchReturnVersionsService =
  require('../../../app/services/licences/fetch-return-versions.service.js')

describe('Fetch Return Versions service', () => {
  const startDate = new Date('2022-04-01')

  let currentReturnVersion
  let currentReturnVersionModLog
  let supersededReturnVersion

  describe('when the licence has return versions data', () => {
    beforeEach(async () => {
      // NOTE: We add these 2, both with the same start date to ensure the order that they are returned as expected
      supersededReturnVersion = await ReturnVersionHelper.add({
        startDate, status: 'superseded', version: 100
      })
      currentReturnVersion = await ReturnVersionHelper.add({
        licenceId: supersededReturnVersion.licenceId, startDate, status: 'current', version: 101
      })

      // We add this 3rd one with a status of draft to ensure it is not included
      await ReturnVersionHelper.add({
        licenceId: supersededReturnVersion.licenceId, startDate: new Date('2022-05-01'), status: 'draft', version: 102
      })

      currentReturnVersionModLog = await ModLogHelper.add({
        reasonDescription: 'Record Loaded During Migration', returnVersionId: currentReturnVersion.id
      })
    })

    it('returns the matching return versions data', async () => {
      const result = await FetchReturnVersionsService.go(supersededReturnVersion.licenceId)

      expect(result).to.equal([
        {
          id: currentReturnVersion.id,
          startDate: new Date('2022-04-01'),
          endDate: null,
          status: 'current',
          reason: 'new-licence',
          modLogs: [{
            id: currentReturnVersionModLog.id,
            reasonDescription: 'Record Loaded During Migration'
          }]
        },
        {
          id: supersededReturnVersion.id,
          startDate: new Date('2022-04-01'),
          endDate: null,
          status: 'superseded',
          reason: 'new-licence',
          modLogs: []
        }
      ])
    })
  })
})
