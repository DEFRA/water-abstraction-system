'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicenceHistoryPresenter = require('../../../app/presenters/licences/view-licence-history.presenter.js')

describe.only('View Licence History presenter', () => {
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
            createdBy: 'admin-internal@wrls.gov.uk',
            dateCreated: '26 July 2024',
            link: '/licences/91aff99a-3204-4727-86bd-7bdf3ef24533/charge-information/93b8a9c9-f420-44ca-b899-33aff7fe34e0/view',
            note: 'This is a test to see if history works',
            reason: 'New licence',
            source: 'wrls',
            type: 'Charge version',
            version: 106
          },
          {
            createdBy: 'admin-internal@wrls.gov.uk',
            dateCreated: '22 July 2024',
            link: '/licences/91aff99a-3204-4727-86bd-7bdf3ef24533/charge-information/11b74e78-f797-4d20-aff9-8ef862e59eb6/view',
            note: null,
            reason: 'Shell licence ',
            source: 'wrls',
            type: 'Charge version',
            version: 105
          },
          {
            createdBy: 'Migrated from NALD',
            dateCreated: '15 December 2023',
            link: '/system/return-requirements/7b3b53c5-bffd-4d3a-a2a7-e3a66119b338/view',
            note: '869616000 CMA ****2376000 CMD, 869616000 CMA ****2376000 CMD, *2,376,000 CMD, 720 CMD, *2,376,000 CMD, 720 CMD, 720 CMD',
            reason: null,
            source: null,
            type: 'Return version',
            version: 4
          },
          {
            createdBy: 'Migrated from NALD',
            dateCreated: '15 December 2023',
            link: '/system/return-requirements/8eecdc56-cce3-47b8-a704-137b05503de4/view',
            note: '869616000 CMA ****2376000 CMD, 869616000 CMA ****2376000 CMD, *2,376,000 CMD, 720 CMD, *2,376,000 CMD, 720 CMD, 720 CMD',
            reason: null,
            source: null,
            type: 'Return version',
            version: 3
          },
          {
            createdBy: 'Migrated from NALD',
            dateCreated: '14 December 2023',
            link: null,
            note: null,
            reason: '',
            source: null,
            type: 'Licence version',
            version: 102
          },
          {
            createdBy: 'Migrated from NALD',
            dateCreated: '14 December 2023',
            link: null,
            note: null,
            reason: '',
            source: null,
            type: 'Licence version',
            version: 101
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
        note: '869616000 CMA ****2376000 CMD, 869616000 CMA ****2376000 CMD, *2,376,000 CMD, 720 CMD, *2,376,000 CMD, 720 CMD, 720 CMD',
        versionNumber: 4
      },
      {
        licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
        entryType: 'return-version',
        entryId: '8eecdc56-cce3-47b8-a704-137b05503de4',
        reason: null,
        createdAt: new Date('2023-12-15T14:00:04.098Z'),
        createdBy: null,
        note: '869616000 CMA ****2376000 CMD, 869616000 CMA ****2376000 CMD, *2,376,000 CMD, 720 CMD, *2,376,000 CMD, 720 CMD, 720 CMD',
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
