'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')
const ChargeVersionNoteHelper = require('../../support/helpers/charge-version-note.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const ModLogHelper = require('../../support/helpers/mod-log.helper.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')

// Thing under test
const FetchLicenceHistoryService = require('../../../app/services/licences/fetch-licence-history.service.js')

describe('Licences - Fetch Licence History service', () => {
  let chargeVersion
  let chargeVersionModLog
  let chargeVersionNote
  let licence
  let licenceId
  let licenceVersion
  let licenceVersionModLog
  let returnVersion
  let returnVersionModLog

  describe('when the licence has licence versions, charge versions and return versions', () => {
    before(async () => {
      licence = await LicenceHelper.add()

      licenceId = licence.id

      const { licenceRef } = licence

      chargeVersionNote = await ChargeVersionNoteHelper.add()
      chargeVersion = await ChargeVersionHelper.add({ licenceId, licenceRef, noteId: chargeVersionNote.id })
      licenceVersion = await LicenceVersionHelper.add({ licenceId })
      returnVersion = await ReturnVersionHelper.add({ licenceId })

      chargeVersionModLog = await ModLogHelper.add({ chargeVersionId: chargeVersion.id })
      licenceVersionModLog = await ModLogHelper.add({ licenceVersionId: licenceVersion.id })
      returnVersionModLog = await ModLogHelper.add({ returnVersionId: returnVersion.id })
    })

    it('returns the matching licence versions, charge versions and return versions', async () => {
      const result = await FetchLicenceHistoryService.go(licenceId)

      expect(result).to.equal({
        id: licence.id,
        licenceRef: licence.licenceRef,
        chargeVersions: [
          {
            id: chargeVersion.id,
            createdAt: chargeVersion.createdAt,
            createdBy: null,
            changeReason: null,
            chargeVersionNote: {
              id: chargeVersionNote.id,
              note: 'This is a test note'
            },
            startDate: chargeVersion.startDate,
            modLogs: [
              {
                id: chargeVersionModLog.id,
                naldDate: chargeVersionModLog.naldDate,
                note: chargeVersionModLog.note,
                reasonDescription: chargeVersionModLog.reasonDescription,
                userId: chargeVersionModLog.userId
              }
            ]
          }
        ],
        licenceVersions: [
          {
            createdAt: licenceVersion.createdAt,
            id: licenceVersion.id,
            startDate: licenceVersion.startDate,
            modLogs: [
              {
                id: licenceVersionModLog.id,
                naldDate: licenceVersionModLog.naldDate,
                note: licenceVersionModLog.note,
                reasonDescription: licenceVersionModLog.reasonDescription,
                userId: licenceVersionModLog.userId
              }
            ]
          }
        ],
        returnVersions: [
          {
            createdAt: returnVersion.createdAt,
            id: returnVersion.id,
            notes: null,
            createdBy: null,
            reason: 'new-licence',
            startDate: returnVersion.startDate,
            modLogs: [
              {
                id: returnVersionModLog.id,
                naldDate: returnVersionModLog.naldDate,
                note: returnVersionModLog.note,
                reasonDescription: returnVersionModLog.reasonDescription,
                userId: returnVersionModLog.userId
              }
            ],
            user: null
          }
        ]
      })
    })
  })
})
