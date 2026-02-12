'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const ModLogHelper = require('../../support/helpers/mod-log.helper.js')

// Thing under test
const FetchHistoryService = require('../../../app/services/licences/fetch-history.service.js')

describe('Licences - Fetch History service', () => {
  let licence
  let licenceVersion
  let licenceVersionTwo
  let modLog

  before(async () => {
    licence = await LicenceHelper.add()

    licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })

    licenceVersionTwo = await LicenceVersionHelper.add({ licenceId: licence.id, issue: 1, increment: 1 })

    modLog = await ModLogHelper.add({
      licenceVersionId: licenceVersion.id,
      reasonDescription: 'Licence Holder Name/Address Change'
    })
  })

  after(async () => {
    await licence.$query().delete()
    await licenceVersion.$query().delete()
    await licenceVersionTwo.$query().delete()
    await modLog.$query().delete()
  })

  describe('when the licence has licence versions', () => {
    it('returns the matching licence versions', async () => {
      const result = await FetchHistoryService.go(licence.id)

      expect(result).to.equal([
        {
          administrative: true,
          createdAt: licenceVersionTwo.createdAt,
          endDate: licenceVersionTwo.endDate,
          id: licenceVersionTwo.id,
          modLogs: [],
          startDate: licenceVersionTwo.startDate
        },
        {
          administrative: null,
          createdAt: licenceVersion.createdAt,
          endDate: licenceVersion.endDate,
          id: licenceVersion.id,
          modLogs: [
            {
              id: modLog.id,
              naldDate: new Date('2012-06-01'),
              note: null,
              reasonDescription: 'Licence Holder Name/Address Change',
              userId: 'TTESTER'
            }
          ],
          startDate: licenceVersion.startDate
        }
      ])
    })
  })
})
