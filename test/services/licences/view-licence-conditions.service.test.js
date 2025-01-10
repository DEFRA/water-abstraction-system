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
const ViewLicenceConditionsService = require('../../../app/services/licences/view-licence-conditions.service.js')

describe('View Licence Conditions service', () => {
  beforeEach(() => {
    Sinon.stub(FetchLicenceConditionsService, 'go').returns(LicencesFixture.licenceConditions())
  })

  it('correctly presents the data', async () => {
    const result = await ViewLicenceConditionsService.go('761bc44f-80d5-49ae-ab46-0a90495417b5')

    expect(result).to.equal({
      activeNavBar: 'search',
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
      licenceId: '761bc44f-80d5-49ae-ab46-0a90495417b5',
      licenceRef: '01/123',
      pageTitle: 'Licence abstraction conditions'
    })
  })
})
