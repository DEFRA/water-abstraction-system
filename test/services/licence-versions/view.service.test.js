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
  let licence
  let licenceVersion

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    licenceVersion = LicenceVersionModel.fromJson({
      administrative: null,
      createdAt: new Date('2022-01-01'),
      id: generateUUID(),
      licence,
      modLogs: [{ id: generateUUID(), reasonDescription: 'Licence Holder Name/Address Change', userId: 'JOBSWORTH01' }],
      startDate: new Date('2022-01-01')
    })

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
        notes: null,
        pageTitle: 'Licence version starting 1 January 2022',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        reason: 'Licence Holder Name/Address Change created on 1 January 2022 by JOBSWORTH01'
      })
    })
  })
})
