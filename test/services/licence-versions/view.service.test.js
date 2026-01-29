'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ViewLicencesFixture = require('../../support/fixtures/view-licences.fixture.js')

// Things we need to stub
const FetchConditionsService = require('../../../app/services/licences/fetch-conditions.service.js')
const FetchLicenceVersionService = require('../../../app/services/licence-versions/fetch-licence-version.service.js')

// Thing under test
const ViewService = require('../../../app/services/licence-versions/view.service.js')

describe('Licence Versions - View service', () => {
  let auth
  let conditions
  let licenceVersion

  beforeEach(() => {
    auth = {
      credentials: {
        scope: []
      }
    }

    licenceVersion = ViewLicencesFixture.licenceVersion()

    conditions = []

    Sinon.stub(FetchLicenceVersionService, 'go').returns({
      licenceVersion,
      licenceVersionsForPagination: [licenceVersion]
    })

    Sinon.stub(FetchConditionsService, 'go').returns(conditions)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewService.go(licenceVersion.id, auth)

      expect(result).to.equal({
        backLink: {
          href: `/system/licences/${licenceVersion.licence.id}/history`,
          text: 'Go back to history'
        },
        changeType: 'licence issued',
        conditionTypes: [],
        errorInDataEmail: 'water_abstractiondigital@environment-agency.gov.uk',
        licenceDetails: {
          address: ['12 GRIMMAULD PLACE', 'ISLINGTON', 'LONDON', 'GREATER LONDON', 'N1 9LX'],
          applicationNumber: null,
          endDate: null,
          issueDate: null,
          licenceHolderName: 'ORDER OF THE PHOENIX',
          startDate: '1 January 2022'
        },
        notes: null,
        pageTitle: 'Licence version starting 1 January 2022',
        pageTitleCaption: `Licence ${licenceVersion.licence.licenceRef}`,
        pagination: null,
        points: [],
        purposes: [],
        reason: 'Licence Holder Name/Address Change'
      })
    })
  })
})
