'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChangeReasonModel = require('../../../app/models/change-reason.model.js')
const ChargeVersionModel = require('../../../app/models/charge-version.model.js')
const ChargeVersionNoteModel = require('../../../app/models/charge-version-note.model.js')
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
const ModLogModel = require('../../../app/models/mod-log.model.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')

// Thing under test
const HistoryPresenter = require('../../../app/presenters/licences/history.presenter.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

describe('Licences - History presenter', () => {
  let licence
  let licenceHistory

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    licenceHistory = _testLicenceHistory()
  })

  describe('when provided with populated licence history', () => {
    it('correctly presents the data', () => {
      const result = HistoryPresenter.go(licenceHistory, licence)

      expect(result).to.equal({
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
        pageTitleCaption: `Licence ${licence.licenceRef}`
      })
    })

    describe('the "createdBy" property', () => {
      describe('when the entry has a "createdBy"', () => {
        it("returns the entry's `createdBy`", () => {
          const result = HistoryPresenter.go(licenceHistory, licence)

          expect(result.entries[0].createdBy).to.equal('cristiano.ronaldo@atari.com')
        })
      })

      describe('when the entry does not have a "createdBy"', () => {
        it('returns "Migrated from NALD"', () => {
          const result = HistoryPresenter.go(licenceHistory, licence)

          expect(result.entries[1].createdBy).to.equal('Migrated from NALD')
        })
      })
    })

    describe('the "displayNote" property', () => {
      describe('when the entry has a note', () => {
        it('return true', () => {
          const result = HistoryPresenter.go(licenceHistory, licence)

          expect(result.entries[0].displayNote).to.be.true()
        })
      })

      describe('when the entry does not have a note', () => {
        beforeEach(() => {
          licenceHistory.chargeVersions[0].modLogs = []
          licenceHistory.chargeVersions[0].noteId = null
          licenceHistory.chargeVersions[0].chargeVersionNote = null
        })

        it('returns false', () => {
          const result = HistoryPresenter.go(licenceHistory, licence)

          expect(result.entries[0].displayNote).to.be.false()
        })
      })
    })

    describe('the "link" property', () => {
      describe('when the entry is a "charge-version"', () => {
        it('returns the charge version link', () => {
          const result = HistoryPresenter.go(licenceHistory, licence)

          expect(result.entries[0].link).to.equal(
            `/licences/${licence.id}/charge-information/${licenceHistory.chargeVersions[0].id}/view`
          )
        })
      })

      describe('when the entry is a "licence-version"', () => {
        it('returns null', () => {
          const result = HistoryPresenter.go(licenceHistory, licence)

          expect(result.entries[1].link).to.be.null()
        })
      })

      describe('when the entry is a "return-version"', () => {
        it('returns the return version link', () => {
          const result = HistoryPresenter.go(licenceHistory, licence)

          expect(result.entries[2].link).to.equal(`/system/return-versions/${licenceHistory.returnVersions[0].id}`)
        })
      })
    })

    describe('the "reason" property', () => {
      describe('when the entry is a return version', () => {
        describe('and the reason maps to a WRLS reason', () => {
          it('returns the WRLS reason', () => {
            const result = HistoryPresenter.go(licenceHistory, licence)

            expect(result.entries[2].reason).to.equal('New licence')
          })
        })

        describe('and the reason does not map to a WRLS reason', () => {
          beforeEach(() => {
            licenceHistory.returnVersions[0].reason = null
            licenceHistory.returnVersions[0].modLogs = [
              ModLogModel.fromJson({
                reasonDescription: 'This is a reason'
              })
            ]
          })

          it("returns the entry's reason", () => {
            const result = HistoryPresenter.go(licenceHistory, licence)

            expect(result.entries[2].reason).to.equal('This is a reason')
          })
        })
      })
    })

    describe('the "type" property', () => {
      describe('when the entry is "charge-version"', () => {
        it('returns the index 1 and name "Charge version"', () => {
          const result = HistoryPresenter.go(licenceHistory, licence)

          expect(result.entries[0].type).to.equal({ index: 1, name: 'Charge version' })
        })
      })

      describe('when the entry is "return-version"', () => {
        it('returns the index 2 and name "Return version"', () => {
          const result = HistoryPresenter.go(licenceHistory, licence)

          expect(result.entries[2].type).to.equal({ index: 2, name: 'Return version' })
        })
      })

      describe('when the entry is "licence-version"', () => {
        it('returns the index 0 and name "Licence version"', () => {
          const result = HistoryPresenter.go(licenceHistory, licence)

          expect(result.entries[1].type).to.equal({ index: 0, name: 'Licence version' })
        })
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
