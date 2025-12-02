'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const HistoryPresenter = require('../../../app/presenters/licences/history.presenter.js')

describe('Licences - History presenter', () => {
  let licence
  let licenceHistory

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    licenceHistory = [
      LicenceVersionModel.fromJson({
        endDate: new Date('2022-06-05'),
        id: generateUUID(),
        modLogs: [{ id: generateUUID(), reasonDescription: 'Licence Holder Name/Address Change' }],
        startDate: new Date('2022-04-01'),
        administrative: null
      })
    ]
  })

  describe('when provided with populated licence history', () => {
    it('correctly presents the data', () => {
      const result = HistoryPresenter.go(licenceHistory, licence)

      expect(result).to.equal({
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
            reason: 'Licence Holder Name/Address Change',
            startDate: '1 April 2022'
          }
        ],
        pageTitle: 'History',
        pageTitleCaption: `Licence ${licence.licenceRef}`
      })
    })
  })

  describe('the "licenceVersions" property', () => {
    describe('the "changeType" property', () => {
      describe('when the licence version is not administrative', () => {
        it('returns "licence issued"', () => {
          const result = HistoryPresenter.go(licenceHistory, licence)

          expect(result.licenceVersions[0].changeType).to.equal('licence issued')
        })
      })

      describe('when the licence version is administrative', () => {
        beforeEach(() => {
          licenceHistory[0].administrative = true
        })

        it('returns "no licence issued"', () => {
          const result = HistoryPresenter.go(licenceHistory, licence)

          expect(result.licenceVersions[0].changeType).to.equal('no licence issued')
        })
      })
    })
  })
})
