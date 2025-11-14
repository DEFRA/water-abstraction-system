'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicencesFixture = require('../../fixtures/licences.fixture.js')

// Things we need to stub
const FetchLicenceConditionsService = require('../../../app/services/licences/fetch-licence-conditions.service.js')

// Thing under test
const ViewConditionsService = require('../../../app/services/licences/view-conditions.service.js')

describe('Licences - View Conditions service', () => {
  let licencesFixture

  beforeEach(() => {
    licencesFixture = LicencesFixture.licenceConditions()

    Sinon.stub(FetchLicenceConditionsService, 'go').returns(licencesFixture)
  })

  it('correctly presents the data', async () => {
    const result = await ViewConditionsService.go('761bc44f-80d5-49ae-ab46-0a90495417b5')

    expect(result).to.equal({
      activeNavBar: 'search',
      backLink: {
        href: `/system/licences/${licencesFixture.licence.id}/summary`,
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
      pageTitleCaption: `Licence ${licencesFixture.licence.licenceRef}`,
      showingConditions: 'Showing 1 types of further conditions',
      warning: {
        iconFallbackText: 'Warning',
        text: 'We may not be able to show a full list of the conditions, because we do not hold all of the licence information on our system yet. You should refer to the paper copy of the licence to view all conditions.'
      }
    })
  })
})
