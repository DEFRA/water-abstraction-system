'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicenceHistoryPresenter = require('../../../app/presenters/licences/view-licence-history.presenter.js')

describe('View Licence History presenter', () => {
  let licenceHistory

  beforeEach(() => {
    licenceHistory = _licenceHistory()
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
  })
})

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
