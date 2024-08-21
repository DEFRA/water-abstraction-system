'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ContactModel = require('../../../app/models/contact.model.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const ChargeVersionModel = require('../../../app/models/charge-version.model.js')
const ChargeVersionNoteModel = require('../../../app/models/charge-version-note.model.js')
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
const ModLogModel = require('../../../app/models/mod-log.model.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')

// Thing under test
const ViewLicenceHistoryPresenter = require('../../../app/presenters/licences/view-licence-history.presenter.js')

describe.only('View Licence History presenter', () => {
  let licenceHistory

  beforeEach(() => {
    licenceHistory = _licenceHistory2()
  })

  describe('when provided with populated licence history', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceHistoryPresenter.go(licenceHistory)

      expect(result).to.equal({
        entries: [
          {
            createdAt: new Date('2024-07-26T12:19:24.209Z'),
            createdBy: 'admin-internal@wrls.gov.uk',
            dateCreated: '26 July 2024',
            displayNote: true,
            notes: ['This is a test to see if history works'],
            link: '/licences/91aff99a-3204-4727-86bd-7bdf3ef24533/charge-information/93b8a9c9-f420-44ca-b899-33aff7fe34e0/view',
            reason: 'New licence',
            type: {
              index: 1,
              name: 'Charge version'
            }
          },
          {
            createdAt: new Date('2024-07-22T09:04:40.136Z'),
            createdBy: 'admin-internal@wrls.gov.uk',
            dateCreated: '22 July 2024',
            displayNote: false,
            notes: [],
            link: '/licences/91aff99a-3204-4727-86bd-7bdf3ef24533/charge-information/11b74e78-f797-4d20-aff9-8ef862e59eb6/view',
            reason: 'Shell licence ',
            type: {
              index: 1,
              name: 'Charge version'
            }
          },
          {
            createdAt: new Date('2023-12-14T21:31:31.690Z'),
            createdBy: 'Migrated from NALD',
            dateCreated: '14 December 2023',
            displayNote: false,
            notes: [],
            link: null,
            reason: null,
            type: {
              index: 0,
              name: 'Licence version'
            }
          },
          {
            createdAt: new Date('2023-12-14T21:31:31.690Z'),
            createdBy: 'Migrated from NALD',
            dateCreated: '14 December 2023',
            displayNote: false,
            notes: [],
            link: null,
            reason: null,
            type: {
              index: 0,
              name: 'Licence version'
            }
          },
          {
            createdAt: new Date('2008-11-06T00:00:00.000Z'),
            createdBy: 'NALD_OWNER',
            dateCreated: '6 November 2008',
            displayNote: true,
            notes: [
              'Returns requirements changed - Operational Instruction 056_08',
              '869616000 CMA ****2376000 CMD, 869616000 CMA ****2376000 CMD, *2,376,000 CMD, 720 CMD, *2,376,000 CMD,'
            ],
            link: '/system/return-requirements/7b3b53c5-bffd-4d3a-a2a7-e3a66119b338/view',
            reason: 'Changes to Returns requirements April 2008',
            type: {
              index: 2,
              name: 'Return version'
            }
          },
          {
            createdAt: new Date('2008-11-06T00:00:00.000Z'),
            createdBy: 'NALD_OWNER',
            dateCreated: '6 November 2008',
            displayNote: true,
            notes: [
              'Returns requirements changed - Operational Instruction 056_08',
              '869616000 CMA ****2376000 CMD, 869616000 CMA ****2376000 CMD, *2,376,000 CMD, 720 CMD, *2,376,000 CMD,'
            ],
            link: '/system/return-requirements/8eecdc56-cce3-47b8-a704-137b05503de4/view',
            reason: 'Changes to Returns requirements April 2008',
            type: {
              index: 2,
              name: 'Return version'
            }
          }
        ],
        licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
        licenceRef: '01/117'
      })
    })

    describe('the "createdAt" property', () => {
      describe('when the entries "modLog" is null', () => {
        it('returns the entries return version "createdAt"', () => {
          const result = ViewLicenceHistoryPresenter.go(licenceHistory)

          expect(result.entries[0].createdAt).to.equal(licenceHistory.entries[0].createdAt)
        })
      })

      describe('when the entries "modLog" property contains a "createdAt" property', () => {
        beforeEach(() => {
          licenceHistory.entries[0].modLog = {
            code: 'XRET',
            note: 'modLog test note!',
            createdAt: '2002-07-06',
            createdBy: 'TEST!',
            description: 'This is a test!'
          }
        })

        it('returns the entries "modLog" property "createdAt" property', () => {
          const result = ViewLicenceHistoryPresenter.go(licenceHistory)

          expect(result.entries[5].dateCreated).to.equal('6 July 2002')
        })
      })
    })

    describe('the "createdBy" property', () => {
      describe('when the entries "createdBy" is null and the entries "modLog.createdBy" property is null', () => {
        beforeEach(() => {
          licenceHistory.entries[0].createdBy = null
        })

        it('returns the "Migrated from NALD"', () => {
          const result = ViewLicenceHistoryPresenter.go(licenceHistory)

          expect(result.entries[0].createdBy).to.equal('Migrated from NALD')
        })
      })

      describe('when the entries "createdBy" is null but the entries "modLog.createdBy" property is populated', () => {
        beforeEach(() => {
          licenceHistory.entries[0].createdBy = null
          licenceHistory.entries[0].modLog = {
            createdBy: 'TEST!'
          }
        })

        it('returns the "modLog.createdBy"', () => {
          const result = ViewLicenceHistoryPresenter.go(licenceHistory)

          expect(result.entries[0].createdBy).to.equal('TEST!')
        })
      })

      describe('when the entries "createdBy" and the entries "modLog.createdBy" properties are populated', () => {
        beforeEach(() => {
          licenceHistory.entries[0].modLog = {
            createdBy: 'TEST!'
          }
        })

        it('returns the entries "createdBy"', () => {
          const result = ViewLicenceHistoryPresenter.go(licenceHistory)

          expect(result.entries[0].createdBy).to.equal('admin-internal@wrls.gov.uk')
        })
      })
    })

    describe('the "link" property', () => {
      describe('when the "entryType" is "charge-version"', () => {
        it('returns the charge version link', () => {
          const result = ViewLicenceHistoryPresenter.go(licenceHistory)

          expect(result.entries[0].link).to.equal('/licences/91aff99a-3204-4727-86bd-7bdf3ef24533/charge-information/93b8a9c9-f420-44ca-b899-33aff7fe34e0/view')
        })
      })

      describe('when the "entryType" is "return-version"', () => {
        beforeEach(() => {
          licenceHistory.entries[0].entryType = 'return-version'
        })

        it('returns the return version link', () => {
          const result = ViewLicenceHistoryPresenter.go(licenceHistory)

          expect(result.entries[0].link).to.equal('/system/return-requirements/93b8a9c9-f420-44ca-b899-33aff7fe34e0/view')
        })
      })
    })

    describe('the "notes" property', () => {
      describe('when the entry has both "note" and "modLog.note" properties populated', () => {
        beforeEach(() => {
          licenceHistory.entries[0].modLog = {
            code: 'XRET',
            note: 'This is a modLog test note!',
            createdAt: '2002-07-06',
            createdBy: 'TEST!',
            description: 'This is a test!'
          }
        })

        it('returns an array of notes', () => {
          const result = ViewLicenceHistoryPresenter.go(licenceHistory)
          console.log('🚀🚀🚀 ~ result:', result)

          expect(result.entries[0].notes).to.equal(
            ['This is a test to see if history works',
              'This is a modLog test note!'
            ]
          )
        })
      })
    })

    describe('the "reason" property', () => {

    })

    describe('the "type" property', () => {

    })
  })
})

function _licenceHistory2 () {
  const contact = ContactModel.fromJson({
    firstName: 'Annie',
    middleInitials: 'J',
    lastName: 'Easley',
    salutation: 'Mrs'
  })

  const licence = LicenceModel.fromJson({
    id: '761bc44f-80d5-49ae-ab46-0a90495417b5',
    licenceRef: '01/123',
    licenceDocument: {
      licenceDocumentRoles: [{
        id: '3b903973-2143-47fe-b7a2-b205aa8eb933',
        contact
      }]
    }
  })

  const chargeVersion = ChargeVersionModel.fromJson({
    createdAt: new Date('2022-07-05'),
    id: 'dfe3d0d7-5e53-4e51-9748-169d01816642',
    reason: 'new-licence',
    status: 'current',
    startDate: new Date('2020-04-01'),
    modLogs: [],
    user: { id: 3, username: 'cristiano.ronaldo@atari.com' },
    licence
  })

  const licenceVersion = LicenceVersionModel.fromJson({
    createdAt: new Date('2022-06-05'),
    id: '4c42fd78-6e68-4eaa-9c88-781c323a5a38',
    reason: 'new-licence',
    status: 'current',
    startDate: new Date('2021-04-01'),
    modLogs: [],
    user: { id: 2, username: 'lionel.messi@atari.com' },
    licence
  })

  const returnVersion = ReturnVersionModel.fromJson({
    createdAt: new Date('2022-04-05'),
    id: '3f09ce0b-288c-4c0b-b519-7329fe70a6cc',
    multipleUpload: false,
    notes: 'A special note',
    reason: 'new-licence',
    startDate: new Date('2022-04-01'),
    status: 'current',
    modLogs: [],
    user: { id: 1, username: 'carol.shaw@atari.com' },
    licence
  })

  return [...chargeVersion, ...licenceVersion, ...returnVersion]
}

function _licenceHistory () {
  return {
    entries: [
      {
        licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
        entryType: 'charge-version',
        entryId: '93b8a9c9-f420-44ca-b899-33aff7fe34e0',
        reason: 'New licence',
        createdAt: new Date('2024-07-26T12:19:24.209Z'),
        createdBy: 'admin-internal@wrls.gov.uk',
        modLog: '',
        note: 'This is a test to see if history works',
        versionNumber: 106,
        source: 'wrls'
      },
      {
        licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
        entryType: 'charge-version',
        entryId: '11b74e78-f797-4d20-aff9-8ef862e59eb6',
        reason: 'Shell licence ',
        createdAt: new Date('2024-07-22T09:04:40.136Z'),
        createdBy: 'admin-internal@wrls.gov.uk',
        modLog: '',
        note: null,
        versionNumber: 105,
        source: 'wrls'
      },
      {
        licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
        entryType: 'licence-version',
        entryId: 'dcc707f6-197e-4779-814a-7572b68a9b7a',
        reason: '',
        createdAt: new Date('2023-12-14T21:31:31.690Z'),
        createdBy: '',
        modLog: '',
        note: '',
        versionNumber: 102
      },
      {
        licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
        entryType: 'licence-version',
        entryId: '64eb001f-af5c-4157-88dd-5f0c5ddcef40',
        reason: '',
        createdAt: new Date('2023-12-14T21:31:31.690Z'),
        createdBy: '',
        modLog: '',
        note: '',
        versionNumber: 101
      },
      {
        licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
        entryType: 'return-version',
        entryId: '7b3b53c5-bffd-4d3a-a2a7-e3a66119b338',
        reason: null,
        createdAt: new Date('2023-12-15T14:00:04.098Z'),
        createdBy: null,
        modLog: {
          code: 'XRET',
          note: 'Returns requirements changed - Operational Instruction 056_08',
          createdAt: '2008-11-06',
          createdBy: 'NALD_OWNER',
          description: 'Changes to Returns requirements April 2008'
        },
        note: '869616000 CMA ****2376000 CMD, 869616000 CMA ****2376000 CMD, *2,376,000 CMD, 720 CMD, *2,376,000 CMD,',
        versionNumber: 4
      },
      {
        licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
        entryType: 'return-version',
        entryId: '8eecdc56-cce3-47b8-a704-137b05503de4',
        reason: null,
        createdAt: new Date('2023-12-15T14:00:04.098Z'),
        createdBy: null,
        modLog: {
          code: 'XRET',
          note: 'Returns requirements changed - Operational Instruction 056_08',
          createdAt: '2008-11-06',
          createdBy: 'NALD_OWNER',
          description: 'Changes to Returns requirements April 2008'
        },
        note: '869616000 CMA ****2376000 CMD, 869616000 CMA ****2376000 CMD, *2,376,000 CMD, 720 CMD, *2,376,000 CMD,',
        versionNumber: 3
      }
    ],
    licence: {
      id: '91aff99a-3204-4727-86bd-7bdf3ef24533',
      licenceRef: '01/117',
      createdAt: new Date('2023-12-14T21:31:31.686Z')
    }
  }
}
