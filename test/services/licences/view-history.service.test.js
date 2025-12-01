'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
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

    licenceHistory = [
      LicenceVersionModel.fromJson({
        endDate: new Date('2022-06-05'),
        id: generateUUID(),
        modLogs: [],
        startDate: new Date('2022-04-01')
      })
    ]

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
          href: `/licences`,
          text: 'Go back to search'
        },
        licenceVersions: [
          {
            action: {
              link: `/system/licence-versions/${licenceHistory[0].id}`,
              text: 'View'
            },
            changeType: 'licence issued',
            endDate: '5 June 2022',
            reason: null,
            startDate: '1 April 2022'
          }
        ],
        pageTitle: 'History',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        roles: ['billing']
      })
    })
  })
})
