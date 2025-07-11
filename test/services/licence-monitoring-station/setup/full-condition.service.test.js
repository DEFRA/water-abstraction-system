'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things to stub
const FetchFullConditionService = require('../../../../app/services/licence-monitoring-station/setup/fetch-full-condition.service.js')

// Thing under test
const FullConditionService = require('../../../../app/services/licence-monitoring-station/setup/full-condition.service.js')

describe('Licence Monitoring Station Setup - Full Condition Service', () => {
  let condition
  let session

  beforeEach(async () => {
    condition = {
      id: 'd5d05f06-b380-4f74-a479-9cbdb81bc279',
      notes: 'NOTES',
      param1: 'PARAM_1',
      param2: 'PARAM_2',
      createdAt: Date.now(),
      displayTitle: 'DISPLAY_TITLE'
    }

    Sinon.stub(FetchFullConditionService, 'go').resolves([condition])

    session = await SessionHelper.add({
      data: {
        label: 'Monitoring Station',
        licenceId: 'LICENCE_ID',
        licenceRef: 'LICENCE_REF'
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
        pageTitle: `Select the full condition for licence LICENCE_REF`,
        radioButtons: [
          {
            value: condition.id,
            text: 'DISPLAY_TITLE 1',
            hint: {
              text: 'NOTES (Additional information 1: PARAM_1) (Additional information 2: PARAM_2)'
            },
            checked: false
          },
          { divider: 'or' },
          {
            value: 'no_condition',
            text: 'The condition is not listed for this licence',
            checked: false
          }
        ]
      })
    })
  })
})
