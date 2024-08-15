'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')
const ChargeVersionNoteHelper = require('../../support/helpers/charge-version-note.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')

// Thing under test
const FetchLicenceHistoryService = require('../../../app/services/licences/fetch-licence-history.service.js')

describe('Fetch Licence History service', () => {
  let chargeVersion
  let licence
  let licenceId
  let licenceVersion
  let returnVersion

  describe('when the licence has licence versions, charge versions and return versions', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()

      licenceId = licence.id

      const { licenceRef } = licence

      const chargeVersionNote = await ChargeVersionNoteHelper.add()

      chargeVersion = await ChargeVersionHelper.add({ licenceId, licenceRef, noteId: chargeVersionNote.id })
      licenceVersion = await LicenceVersionHelper.add({ licenceId })
      returnVersion = await ReturnVersionHelper.add({
        licenceId,
        modLog: {
          code: 'XRET',
          note: 'Returns requirements changed - Operational Instruction 056_08',
          createdAt: '2008-11-06',
          createdBy: 'NALD_OWNER',
          description: 'Changes to Returns requirements April 2008'
        }
      })
    })

    it('returns the matching licence versions, charge versions and return versions', async () => {
      const result = await FetchLicenceHistoryService.go(licenceId)

      expect(result).to.equal({
        entries: [
          {
            createdAt: chargeVersion.createdAt,
            createdBy: null,
            entryId: chargeVersion.id,
            entryType: 'charge-version',
            licenceId,
            modLog: '',
            note: 'This is a test note',
            reason: null,
            source: 'wrls',
            versionNumber: 1
          },
          {
            createdAt: licenceVersion.createdAt,
            createdBy: '',
            entryId: licenceVersion.id,
            entryType: 'licence-version',
            licenceId,
            modLog: '',
            note: '',
            reason: '',
            versionNumber: 1
          },
          {
            createdAt: returnVersion.createdAt,
            createdBy: null,
            entryId: returnVersion.id,
            entryType: 'return-version',
            licenceId,
            modLog: {
              code: 'XRET',
              createdAt: '2008-11-06',
              createdBy: 'NALD_OWNER',
              description: 'Changes to Returns requirements April 2008',
              note: 'Returns requirements changed - Operational Instruction 056_08'
            },
            note: null,
            reason: 'new-licence',
            versionNumber: 100
          }
        ],
        licence: {
          createdAt: licence.createdAt,
          id: licenceId,
          licenceRef: licence.licenceRef
        }
      })
    })
  })
})
