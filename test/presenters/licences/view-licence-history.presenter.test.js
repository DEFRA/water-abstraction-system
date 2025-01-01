'use strict'

// Test framework dependencies
const { describe, it, beforeEach } = require('node:test')
const { expect } = require('@hapi/code')

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
            createdAt: new Date('2023-07-05T00:00:00.000Z'),
            createdBy: 'cristiano.ronaldo@atari.com',
            dateCreated: '5 July 2023',
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

    describe('the "createdBy" property', () => {
      describe('when the entry has a "createdBy"', () => {
        it("returns the entry's `createdBy`", () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[0].createdBy).to.equal('cristiano.ronaldo@atari.com')
        })
      })

      describe('when the entry does not have a "createdBy"', () => {
        it('returns "Migrated from NALD"', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[1].createdBy).to.equal('Migrated from NALD')
        })
      })
    })

    describe('the "displayNote" property', () => {
      describe('when the entry has a note', () => {
        it('return true', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[0].displayNote).to.be.true()
        })
      })

      describe('when the entry does not have a note', () => {
        beforeEach(() => {
          licence.chargeVersions[0].noteId = null
          licence.chargeVersions[0].chargeVersionNote = null
        })

        it('returns false', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[0].displayNote).to.be.false()
        })
      })
    })

    describe('the "link" property', () => {
      describe('when the entry is a "charge-version"', () => {
        it('returns the charge version link', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[0].link).to.equal(
            '/licences/761bc44f-80d5-49ae-ab46-0a90495417b5/charge-information/dfe3d0d7-5e53-4e51-9748-169d01816642/view'
          )
        })
      })

      describe('when the entry is a "licence-version"', () => {
        it('returns null', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[1].link).to.be.null()
        })
      })

      describe('when the entry is a "return-version"', () => {
        it('returns the return version link', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[2].link).to.equal('/system/return-versions/3f09ce0b-288c-4c0b-b519-7329fe70a6cc')
        })
      })
    })

    describe('the "reason" property', () => {
      describe('when the entry is a return version', () => {
        describe('and the reason maps to a WRLS reason', () => {
          it('returns the WRLS reason', () => {
            const result = ViewLicenceHistoryPresenter.go(licence)

            expect(result.entries[2].reason).to.equal('New licence')
          })
        })

        describe('and the reason does not map to a WRLS reason', () => {
          beforeEach(() => {
            licence.returnVersions[0].reason = null
            licence.returnVersions[0].modLogs = [
              ModLogModel.fromJson({
                reasonDescription: 'This is a reason'
              })
            ]
          })

          it("returns the entry's reason", () => {
            const result = ViewLicenceHistoryPresenter.go(licence)

            expect(result.entries[2].reason).to.equal('This is a reason')
          })
        })
      })
    })

    describe('the "type" property', () => {
      describe('when the entry is "charge-version"', () => {
        it('returns the index 1 and name "Charge version"', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[0].type).to.equal({ index: 1, name: 'Charge version' })
        })
      })

      describe('when the entry is "return-version"', () => {
        it('returns the index 2 and name "Return version"', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[2].type).to.equal({ index: 2, name: 'Return version' })
        })
      })

      describe('when the entry is "licence-version"', () => {
        it('returns the index 0 and name "Licence version"', () => {
          const result = ViewLicenceHistoryPresenter.go(licence)

          expect(result.entries[1].type).to.equal({ index: 0, name: 'Licence version' })
        })
      })
    })
  })
})

function _testLicence() {
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
      licenceDocumentRoles: [
        {
          id: '3b903973-2143-47fe-b7a2-b205aa8eb933'
        }
      ]
    }
  })

  const chargeVersions = ChargeVersionModel.fromJson({
    createdAt: new Date('2023-07-05'),
    createdBy: { id: 3, email: 'cristiano.ronaldo@atari.com' },
    id: 'dfe3d0d7-5e53-4e51-9748-169d01816642',
    reason: 'new-licence',
    status: 'current',
    startDate: new Date('2020-04-01'),
    modLogs: [],
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
    licenceVersions: [licenceVersions],
    chargeVersions: [chargeVersions],
    returnVersions: [returnVersions]
  }
}
