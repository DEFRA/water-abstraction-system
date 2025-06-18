'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypeHelper = require('../../../support/helpers/licence-version-purpose-condition-type.helper.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const FullConditionService = require('../../../../app/services/licence-monitoring-station/setup/full-condition.service.js')

const CES_CONDITION_TYPE = LicenceVersionPurposeConditionTypeHelper.select(20)

describe('Full Condition Service', () => {
  let condition
  let licence
  let session

  beforeEach(async () => {
    licence = await LicenceHelper.add()

    const licenceVersion = await LicenceVersionHelper.add({
      licenceId: licence.id,
      status: 'current'
    })

    const licenceVersionPurposeHelper = await LicenceVersionPurposeHelper.add({
      licenceVersionId: licenceVersion.id
    })

    condition = await LicenceVersionPurposeConditionHelper.add({
      licenceVersionPurposeId: licenceVersionPurposeHelper.id,
      licenceVersionPurposeConditionTypeId: CES_CONDITION_TYPE.id
    })

    session = await SessionHelper.add({
      data: {
        label: 'Monitoring Station',
        licenceId: licence.id,
        licenceRef: licence.licenceRef
      }
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the expected output', async () => {
      const result = await FullConditionService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: `/system/licence-monitoring-station/setup/${session.id}/licence-number`,
        monitoringStationLabel: 'Monitoring Station',
        pageTitle: `Select the full condition for licence ${licence.licenceRef}`,
        radioButtons: [
          {
            value: condition.id,
            text: 'Chemical cessation condition 1',
            hint: {
              text: '(Additional information 1: None) (Additional information 2: None)'
            },
            checked: false
          },
          { divider: 'or' },
          {
            value: 'not_listed',
            text: 'The condition is not listed for this licence',
            checked: false
          }
        ]
      })
    })
  })
})
