'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

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

// Thing under test
const ViewLicenceHistoryPresenter = require('../../../app/presenters/licences/view-licence-history.presenter.js')

describe('View Licence History presenter', () => {
  let licence

  beforeEach(() => {
    licence = _testLicence()
  })

  describe('when provided with populated licence history', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceHistoryPresenter.go(licence)

      expect(result).to.equal({
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
            link: '/system/return-requirements/3f09ce0b-288c-4c0b-b519-7329fe70a6cc/view',
            reason: 'New licence',
            type: { index: 2, name: 'Return version' }
          }
        ]
      })
    })

    describe('the "createdAt" property', () => {
      describe('when the entries "modLogs" is empty', () => {
        beforeEach(() => {
          licence.chargeVersions[0].modLogs = []
        })

        it('returns the entries return version "createdAt"', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[0].createdAt).to.equal(licence.chargeVersions[0].createdAt)
        })
      })

      describe('when the entries "modLogs" property contains a "createdAt" property', () => {
        it('returns the entries "modLog" property "createdAt" property', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[0].dateCreated).to.equal('3 April 2023')
        })
      })
    })

    describe('the "createdBy" property', () => {
      describe('when the entries "createdBy" is null and the entries "modLog.userId" property is null', () => {
        beforeEach(() => {
          licence.chargeVersions[0].createdBy = null
          licence.chargeVersions[0].modLogs[0].userId = null
        })

        it('returns the "Migrated from NALD"', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[0].createdBy).to.equal('Migrated from NALD')
        })
      })

      describe('when the entries "createdBy" is null but the entries "modLog.userId" property is populated', () => {
        beforeEach(() => {
          licence.chargeVersions[0].createdBy = null
        })

        it('returns the "modLog.createdBy"', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[0].createdBy).to.equal('TEST_NALD_OWNER')
        })
      })

      describe('when the entries "createdBy" and the entries "modLog.userId" properties are populated', () => {
        it('returns the entries "createdBy"', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[0].createdBy).to.equal('cristiano.ronaldo@atari.com')
        })
      })
    })

    describe('the "link" property', () => {
      describe('when the "entryType" is "charge-version"', () => {
        it('returns the charge version link', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[0].link).to.equal('/licences/761bc44f-80d5-49ae-ab46-0a90495417b5/charge-information/dfe3d0d7-5e53-4e51-9748-169d01816642/view')
        })
      })

      describe('when the "entryType" is "return-version"', () => {
        beforeEach(() => {
          licence.returnVersions[0].entryType = 'return-version'
        })

        it('returns the return version link', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[2].link).to.equal('/system/return-requirements/3f09ce0b-288c-4c0b-b519-7329fe70a6cc/view')
        })
      })
    })

    describe('the "notes" property', () => {
      describe('when the entry is a charge version', () => {
        describe('and the entry has a charge version note linked and "modLog.note" properties populated', () => {
          it('returns only the charge version note', () => {
            const result = ViewLicenceHistoryPresenter.go(licence)

            expect(result.entries[0].notes).to.equal(['Charge version test note'])
          })
        })

        describe('when only the "modLog.note" property is populated', () => {
          beforeEach(() => {
            licence.chargeVersions[0].chargeVersionNote = null
          })

          it('returns an array of the "modLog.note"', () => {
            const result = ViewLicenceHistoryPresenter.go(licence)

            expect(result.entries[0].notes).to.equal(['modLog test note!'])
          })
        })
      })

      describe('when the entry is a licence version', () => {
        describe('and has the "modLog.notes" populated', () => {
          beforeEach(() => {
            licence.licenceVersions[0].modLogs = [ModLogModel.fromJson({
              note: 'Licence version test note!'
            })]
          })

          it('returns an array of the "modLog.note"', () => {
            const result = ViewLicenceHistoryPresenter.go(licence)

            expect(result.entries[1].notes).to.equal(['Licence version test note!'])
          })
        })
      })

      describe('when the entry is a return version', () => {
        describe('and the entry has both the "notes" and "modLog.notes" property populated', () => {
          beforeEach(() => {
            licence.returnVersions[0].modLogs = [ModLogModel.fromJson({
              note: 'Return version test note!'
            })]
          })

          it('returns an array of both the "notes" and "modLog.notes"', () => {
            const result = ViewLicenceHistoryPresenter.go(licence)

            expect(result.entries[2].notes).to.equal(['Return version test note!', 'Test note'])
          })
        })

        describe('and the entry only has the "notes" property populated', () => {
          it('returns an array of both the "notes" and "modLog.notes"', () => {
            const result = ViewLicenceHistoryPresenter.go(licence)

            expect(result.entries[2].notes).to.equal(['Test note'])
          })
        })
      })

      describe('and the entry only has the "modLog.notes" property populated', () => {
        beforeEach(() => {
          licence.returnVersions[0].modLogs = [ModLogModel.fromJson({
            note: 'Return version test note!'
          })]

          licence.returnVersions[0].notes = null
        })

        it('returns an array of both the "notes" and "modLog.notes"', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[2].notes).to.equal(['Return version test note!'])
        })
      })
    })

    describe('the "reason" property', () => {
      describe('when the entry is a charge version', () => {
        describe('and the entry has a change reason linked and the "modLog.reasonDescription" is populated', () => {
          it('returns the linked change reason description', () => {
            const result = ViewLicenceHistoryPresenter.go(licence)

            expect(result.entries[0].reason).to.equal('Major change')
          })
        })

        describe('and only the "modLog.reasonDescription" is populated', () => {
          beforeEach(() => {
            licence.chargeVersions[0].changeReason = null
          })

          it('returns the "modLog.reasonDescription"', () => {
            const result = ViewLicenceHistoryPresenter.go(licence)

            expect(result.entries[0].reason).to.equal('This is a test!')
          })
        })
      })

      describe('when the entry is a licence version', () => {
        describe('and the entry "modLog.reasonDescription" is populated', () => {
          beforeEach(() => {
            licence.licenceVersions[0].modLogs = [ModLogModel.fromJson({
              reasonDescription: 'This is a test!'
            })]
          })

          it('returns the "modLog.reasonDescription"', () => {
            const result = ViewLicenceHistoryPresenter.go(licence)

            expect(result.entries[1].reason).to.equal('This is a test!')
          })
        })
      })

      describe('when the entry is a return version', () => {
        describe('and the entry has both the "reason" and "modLog.reasonDescription" populated', () => {
          beforeEach(() => {
            licence.returnVersions[0].modLogs = [ModLogModel.fromJson({
              reasonDescription: 'This is a test!'
            })]
          })

          it('returns the entry "reason"', () => {
            const result = ViewLicenceHistoryPresenter.go(licence)

            expect(result.entries[2].reason).to.equal('New licence')
          })
        })

        describe('and only the "modLog.reasonDescription" is populated', () => {
          beforeEach(() => {
            licence.returnVersions[0].modLogs = [ModLogModel.fromJson({
              reasonDescription: 'This is a test!'
            })]

            licence.returnVersions[0].reason = null
          })

          it('returns the "modLog.reasonDescription"', () => {
            const result = ViewLicenceHistoryPresenter.go(licence)

            expect(result.entries[2].reason).to.equal('This is a test!')
          })
        })
      })
    })

    describe('the "type" property', () => {
      describe('when the "entryType" is "charge-version"', () => {
        it('returns the index 1 and name "Charge version"', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[0].type).to.equal({ index: 1, name: 'Charge version' })
        })
      })

      describe('when the "entryType" is "return-version"', () => {
        it('returns the index 2 and name "Return version"', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[2].type).to.equal({ index: 2, name: 'Return version' })
        })
      })

      describe('when the "entryType" is "licence-version"', () => {
        it('returns the index 0 and name "Licence version"', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[1].type).to.equal({ index: 0, name: 'Licence version' })
        })
      })
    })
  })
})

function _testLicence () {
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
