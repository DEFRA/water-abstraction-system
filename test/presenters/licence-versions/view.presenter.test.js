'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Thing under test
const ViewPresenter = require('../../../app/presenters/licence-versions/view.presenter.js')

describe('Licence Versions - View presenter', () => {
  let licence
  let licenceVersion

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    licenceVersion = {
      id: generateUUID(),
      licence,
      startDate: new Date('2022-01-01')
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ViewPresenter.go(licenceVersion)

      expect(result).to.equal({
        backLink: {
          href: `/system/licences/${licence.id}/history`,
          text: 'Back to history'
        },
        changeType: 'licence issued',
        pageTitle: 'Licence version starting 1 January 2022',
        pageTitleCaption: `Licence ${licence.licenceRef}`
      })
    })
  })

  describe('the "changeType" property', () => {
    describe('when the licence version is not administrative', () => {
      it('returns "licence issued"', () => {
        const result = ViewPresenter.go(licenceVersion)

        expect(result.changeType).to.equal('licence issued')
      })
    })

    describe('when the licence version is administrative', () => {
      beforeEach(() => {
        licenceVersion.administrative = true
      })

      it('returns "no licence issued"', () => {
        const result = ViewPresenter.go(licenceVersion)

        expect(result.changeType).to.equal('no licence issued')
      })
    })
  })
})
