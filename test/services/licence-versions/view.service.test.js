'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchLicenceVersionService = require('../../../app/services/licence-versions/fetch-licence-version.service.js')

// Thing under test
const ViewService = require('../../../app/services/licence-versions/view.service.js')

describe('Licence Versions - View service', () => {
  let licence
  let licenceVersion

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    licenceVersion = {
      administrative: null,
      id: generateUUID(),
      licence,
      startDate: new Date('2022-01-01')
    }

    Sinon.stub(FetchLicenceVersionService, 'go').returns(licenceVersion)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewService.go(licenceVersion.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/licences/${licence.id}/history`,
          text: 'Go back to history'
        },
        changeType: 'licence issued',
        pageTitle: 'Licence version starting 1 January 2022',
        pageTitleCaption: `Licence ${licence.licenceRef}`
      })
    })
  })
})
