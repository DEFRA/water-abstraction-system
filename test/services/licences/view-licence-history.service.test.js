'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChangeReasonModel = require('../../../app/models/change-reason.model.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const ChargeVersionModel = require('../../../app/models/charge-version.model.js')
const ChargeVersionNoteModel = require('../../../app/models/charge-version-note.model.js')
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
const ModLogModel = require('../../../app/models/mod-log.model.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')

// Things we need to stub
const FetchLicenceHistoryService = require('../../../app/services/licences/fetch-licence-history.service.js')

// Thing under test
const ViewLicenceHistoryService = require('../../../app/services/licences/view-licence-history.service.js')

describe('View Licence History service', () => {
  const licenceId = '91aff99a-3204-4727-86bd-7bdf3ef24533'

  beforeEach(() => {
    Sinon.stub(FetchLicenceHistoryService, 'go').returns(_testFetchLicenceHistory())
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewLicenceHistoryService.go(licenceId)

      expect(result).to.equal({
        activeNavBar: 'search',
        licenceId: '761bc44f-80d5-49ae-ab46-0a90495417b5',
        licenceRef: '01/123',
        pageTitle: 'History for 01/123',
        entries: [
          {
            createdAt: new Date('2023-04-03T00:00:00.000Z'),
            createdBy: 'cristiano.ronaldo@atari.com',
            dateCreated: '3 April 2023',
            displayNote: true,
            notes: ['Charge version test note'],
            link: '/licences/761bc44f-80d5-49ae-ab46-0a90495417b5/charge-information/dfe3d0d7-5e53-4e51-9748-169d01816642/view',
            reason: 'Major change',
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
            type: { index: 0, name: 'Licence version' }
          },
          {
            createdAt: new Date('2021-04-05T00:00:00.000Z'),
            createdBy: 'Migrated from NALD',
            dateCreated: '5 April 2021',
            displayNote: true,
            notes: ['Test note'],
            link: '/system/return-versions/3f09ce0b-288c-4c0b-b519-7329fe70a6cc',
            reason: 'New licence',
            type: { index: 2, name: 'Return version' }
          }
        ]
      })
    })
  })
})

function _testFetchLicenceHistory () {
  const changeReason = ChangeReasonModel.fromJson({
    id: '0dee4596-0867-4997-8a00-e0998cfcefc0',
    description: 'Major change'
  })

  const chargeVersionNote = ChargeVersionNoteModel.fromJson({
    id: '27ac6412-5f73-4e35-8885-236bfea92a1c',
    note: 'Charge version test note'
  })

  const testLicence = LicenceModel.fromJson({
    id: '761bc44f-80d5-49ae-ab46-0a90495417b5',
    licenceRef: '01/123',
    licenceDocument: {
      licenceDocumentRoles: [{
        id: '3b903973-2143-47fe-b7a2-b205aa8eb933'
      }]
    }
  })

  const modLog = ModLogModel.fromJson({
    id: 'c79c86b3-4b5a-464b-b321-585cd280c396',
    naldDate: new Date('2023-04-03'),
    note: 'modLog test note!',
    reasonDescription: 'This is a test!',
    userId: 'TEST_NALD_OWNER'
  })

  const chargeVersions = ChargeVersionModel.fromJson({
    createdAt: new Date('2023-07-05'),
    createdBy: { id: 3, email: 'cristiano.ronaldo@atari.com' },
    id: 'dfe3d0d7-5e53-4e51-9748-169d01816642',
    reason: 'new-licence',
    status: 'current',
    startDate: new Date('2020-04-01'),
    modLogs: [modLog],
    chargeVersionNote,
    changeReason,
    noteId: '27ac6412-5f73-4e35-8885-236bfea92a1c'
  })

  const licenceVersions = LicenceVersionModel.fromJson({
    createdAt: new Date('2022-06-05'),
    id: '4c42fd78-6e68-4eaa-9c88-781c323a5a38',
    reason: 'new-licence',
    status: 'current',
    startDate: new Date('2022-04-01'),
    modLogs: []
  })

  const returnVersions = ReturnVersionModel.fromJson({
    createdAt: new Date('2021-04-05'),
    id: '3f09ce0b-288c-4c0b-b519-7329fe70a6cc',
    multipleUpload: false,
    notes: 'Test note',
    reason: 'new-licence',
    startDate: new Date('2021-04-01'),
    status: 'current',
    modLogs: []
  })

  return {
    id: testLicence.id,
    licenceRef: testLicence.licenceRef,
    licenceVersions: [
      licenceVersions
    ],
    chargeVersions: [
      chargeVersions
    ],
    returnVersions: [
      returnVersions
    ]
  }
}
