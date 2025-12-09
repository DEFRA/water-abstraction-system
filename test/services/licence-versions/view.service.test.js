'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchLicenceVersionService = require('../../../app/services/licence-versions/fetch-licence-version.service.js')

// Thing under test
const ViewService = require('../../../app/services/licence-versions/view.service.js')

describe('Licence Versions - View service', () => {
  let auth
  let licence
  let licenceVersion

  beforeEach(() => {
    auth = {
      credentials: {
        scope: []
      }
    }

    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    licenceVersion = LicenceVersionModel.fromJson({
      administrative: null,
      createdAt: new Date('2022-01-01'),
      id: generateUUID(),
      licence,
      licenceVersionPurposes: [],
      modLogs: [{ id: generateUUID(), reasonDescription: 'Licence Holder Name/Address Change', userId: 'JOBSWORTH01' }],
      startDate: new Date('2022-01-01')
    })

    Sinon.stub(FetchLicenceVersionService, 'go').returns({
      licenceVersion,
      licenceVersionsForPagination: [licenceVersion]
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewService.go(licenceVersion.id, auth)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/licences/${licence.id}/history`,
          text: 'Go back to history'
        },
        changeType: 'licence issued',
        errorInDataEmail: 'water_abstractiondigital@environment-agency.gov.uk',
        notes: null,
        pageTitle: 'Licence version starting 1 January 2022',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        pagination: null,
        points: [],
        reason: 'Licence Holder Name/Address Change'
      })
    })
  })
})
