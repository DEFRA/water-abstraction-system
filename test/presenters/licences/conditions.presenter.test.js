'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ViewLicencesFixture = require('../../support/fixtures/view-licences.fixture.js')

// Thing under test
const ConditionsPresenter = require('../../../app/presenters/licences/conditions.presenter.js')

describe('Licences - Conditions presenter', () => {
  let conditions
  let licence

  beforeEach(() => {
    licence = ViewLicencesFixture.licence()
    conditions = [ViewLicencesFixture.condition()]
  })

  describe('when provided with a populated licence with licence conditions', () => {
    it('returns the expected licence conditions', () => {
      const result = ConditionsPresenter.go(conditions, licence)

      expect(result).to.equal({
        backLink: {
          href: `/system/licences/${licence.id}/summary`,
          text: 'Go back to summary'
        },
        conditionTypes: [
          {
            conditions: [
              {
                abstractionPoints: {
                  descriptions: [
                    'Within the area formed by the straight lines running between National Grid References SD 963 193, SD 963 193, SD 963 193 and SD 963 193 (RIVER OUSE AT BLETSOE)'
                  ],
                  label: 'Abstraction point'
                },
                conditionType: 'Cessation Condition',
                otherInformation: 'DROUGHT CONDITION',
                param1: {
                  label: 'Start date',
                  value: '01/05'
                },
                param2: {
                  label: 'End date',
                  value: '30/09'
                },
                purpose: 'Animal Watering & General Use In Non Farming Situations',
                subcodeDescription: 'Political - Hosepipe Ban'
              }
            ],
            displayTitle: 'Political cessation condition'
          }
        ],
        pageTitle: 'Conditions',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        showingConditions: 'Showing 1 type of further conditions',
        warning: {
          iconFallbackText: 'Warning',
          text: 'We may not be able to show a full list of the conditions, because we do not hold all of the licence information on our system yet. You should refer to the paper copy of the licence to view all conditions.'
        }
      })
    })
  })
})
