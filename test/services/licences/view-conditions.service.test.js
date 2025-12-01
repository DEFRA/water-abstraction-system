'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ViewLicencesFixture = require('../../fixtures/view-licences.fixture.js')

// Things we need to stub
const FetchConditionsService = require('../../../app/services/licences/fetch-conditions.service.js')
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

// Thing under test
const ViewConditionsService = require('../../../app/services/licences/view-conditions.service.js')

describe('Licences - View Conditions service', () => {
  let auth
  let conditions
  let licence

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

    licence = ViewLicencesFixture.licence()
    conditions = [ViewLicencesFixture.condition()]

    Sinon.stub(FetchLicenceService, 'go').returns(licence)

    Sinon.stub(FetchConditionsService, 'go').returns(conditions)
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly presents the data', async () => {
    const result = await ViewConditionsService.go(licence.id, auth)

    expect(result).to.equal({
      activeNavBar: 'search',
      activeSecondaryNav: 'summary',
      activeSummarySubNav: 'conditions',
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
      roles: ['billing'],
      showingConditions: 'Showing 1 type of further conditions',
      warning: {
        iconFallbackText: 'Warning',
        text: 'We may not be able to show a full list of the conditions, because we do not hold all of the licence information on our system yet. You should refer to the paper copy of the licence to view all conditions.'
      }
    })
  })
})
