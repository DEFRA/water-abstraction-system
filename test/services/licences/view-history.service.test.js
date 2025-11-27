'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChangeReasonModel = require('../../../app/models/change-reason.model.js')
const ChargeVersionModel = require('../../../app/models/charge-version.model.js')
const ChargeVersionNoteModel = require('../../../app/models/charge-version-note.model.js')
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
const ModLogModel = require('../../../app/models/mod-log.model.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FetchHistoryService = require('../../../app/services/licences/fetch-history.service.js')
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

// Thing under test
const ViewHistoryService = require('../../../app/services/licences/view-history.service.js')

describe('Licences - View History service', () => {
  let auth
  let licence
  let licenceHistory

  beforeEach(() => {
    auth = {
      credentials: {
        roles: [
          {
            role: 'billing'
          }
        ]
      }
    }

    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    licenceHistory = _testLicenceHistory()

    Sinon.stub(FetchLicenceService, 'go').returns(licence)
    Sinon.stub(FetchHistoryService, 'go').returns(licenceHistory)
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewHistoryService.go(licence.id, auth)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'history',
        backLink: {
          href: `/system/licences/${licence.id}/summary`,
          text: 'Go back to search'
        },
        entries: [
          {
            createdAt: new Date('2023-04-03T00:00:00.000Z'),
            createdBy: 'cristiano.ronaldo@atari.com',
            dateCreated: '3 April 2023',
            displayNote: true,
            notes: ['Charge version test note'],
            link: `/licences/${licence.id}/charge-information/${licenceHistory.chargeVersions[0].id}/view`,
            reason: 'Major change',
            startDate: '1 April 2020',
            type: { index: 1, name: 'Charge version' }
          },
          {
            createdAt: new Date('2022-06-05T00:00:00.000Z'),
            createdBy: 'Migrated from NALD',
            dateCreated: '5 June 2022',
            displayNote: false,
            notes: [],
            link: null,
            reason: null,
            startDate: '1 April 2022',
            type: { index: 0, name: 'Licence version' }
          },
          {
            createdAt: new Date('2021-04-05T00:00:00.000Z'),
            createdBy: 'Migrated from NALD',
            dateCreated: '5 April 2021',
            displayNote: true,
            notes: ['Test note'],
            link: `/system/return-versions/${licenceHistory.returnVersions[0].id}`,
            reason: 'New licence',
            startDate: '1 April 2021',
            type: { index: 2, name: 'Return version' }
          }
        ],
        pageTitle: 'History',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        roles: ['billing']
      })
    })
  })
})

function _testLicenceHistory() {
  const changeReason = ChangeReasonModel.fromJson({
    id: generateUUID(),
    description: 'Major change'
  })

  const chargeVersionNote = ChargeVersionNoteModel.fromJson({
    id: generateUUID(),
    note: 'Charge version test note'
  })

  const modLog = ModLogModel.fromJson({
    id: generateUUID(),
    naldDate: new Date('2023-04-03'),
    note: 'modLog test note!',
    reasonDescription: 'This is a test!',
    userId: 'TEST_NALD_OWNER'
  })

  const chargeVersions = ChargeVersionModel.fromJson({
    createdAt: new Date('2023-07-05'),
    createdBy: { id: 3, email: 'cristiano.ronaldo@atari.com' },
    id: generateUUID(),
    reason: 'new-licence',
    status: 'current',
    startDate: new Date('2020-04-01'),
    modLogs: [modLog],
    chargeVersionNote,
    changeReason,
    noteId: generateUUID()
  })

  const licenceVersions = LicenceVersionModel.fromJson({
    createdAt: new Date('2022-06-05'),
    id: generateUUID(),
    reason: 'new-licence',
    status: 'current',
    startDate: new Date('2022-04-01'),
    modLogs: []
  })

  const returnVersions = ReturnVersionModel.fromJson({
    createdAt: new Date('2021-04-05'),
    id: generateUUID(),
    multipleUpload: false,
    notes: 'Test note',
    reason: 'new-licence',
    startDate: new Date('2021-04-01'),
    status: 'current',
    modLogs: []
  })

  return {
    licenceVersions: [licenceVersions],
    chargeVersions: [chargeVersions],
    returnVersions: [returnVersions]
  }
}
