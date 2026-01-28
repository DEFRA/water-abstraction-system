'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ViewLicencesFixture = require('../../support/fixtures/view-licences.fixture.js')

// Thing under test
const PurposesPresenter = require('../../../app/presenters/licences/purposes.presenter.js')

describe('Licences - Purposes presenter', () => {
  let licence
  let purposes

  beforeEach(() => {
    licence = ViewLicencesFixture.licence()
    purposes = [ViewLicencesFixture.licenceVersionPurpose()]
  })

  describe('when provided with populated licence purposes', () => {
    it('returns the expected licence purpose details', () => {
      const result = PurposesPresenter.go(purposes, licence)

      expect(result).to.equal({
        backLink: {
          href: `/system/licences/${licence.id}/summary`,
          text: 'Go back to summary'
        },
        licencePurposes: [
          {
            abstractionAmounts: [
              '180,000.00 cubic metres per year',
              '720.00 cubic metres per day',
              '144.00 cubic metres per hour',
              '40.00 litres per second'
            ],
            abstractionAmountsTitle: 'Abstraction amounts',
            abstractionMethods: 'Unspecified Pump',
            abstractionMethodsTitle: 'Method of abstraction',
            abstractionPeriod: '1 April to 31 October',
            abstractionPoints: ['At National Grid Reference TL 23198 88603'],
            abstractionPointsTitle: 'Abstraction point',
            purposeDescription: 'Spray Irrigation - Storage'
          }
        ],
        pageTitle: 'Purposes, periods and amounts',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        showingPurposes: 'Showing 1 purpose'
      })
    })
  })
})
