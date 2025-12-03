'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const { generateNoticeReferenceCode } = require('../../../../app/lib/general.lib.js')

// Thing under test
const ViewConfirmationService = require('../../../../app/services/notices/setup/view-confirmation.service.js')

describe('Notices - Setup - Confirmation service', () => {
  const referenceCode = generateNoticeReferenceCode('RINV-')

  let event

  beforeEach(async () => {
    event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnInvitation',
      referenceCode
    })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewConfirmationService.go(event.id)

      expect(result).to.equal({
        activeNavBar: 'notices',
        forwardLink: `/system/notices/${event.id}`,
        monitoringStationLink: null,
        pageTitle: 'Returns invitations sent',
        referenceCode
      })
    })
  })
})
