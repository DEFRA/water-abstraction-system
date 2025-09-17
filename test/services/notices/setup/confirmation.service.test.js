'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Thing under test
const ConfirmationService = require('../../../../app/services/notices/setup/confirmation.service.js')

describe('Notices - Setup - Confirmation service', () => {
  const referenceCode = generateReferenceCode()

  let event

  beforeEach(async () => {
    event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnInvitation',
      referenceCode
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ConfirmationService.go(event.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        forwardLink: `/notifications/report/${event.id}`,
        monitoringStationLink: null,
        pageTitle: 'Returns invitations sent',
        referenceCode
      })
    })
  })
})
