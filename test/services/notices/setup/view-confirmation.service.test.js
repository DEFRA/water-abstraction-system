// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import EventHelper from 'water-abstraction-engine/test/helpers/event.helper.js'
import { generateNoticeReferenceCode } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import ViewConfirmationService from '../../../../src/services/notices/setup/view-confirmation.service.js'

describe('Notices - Setup - View Confirmation service', () => {
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
      const result = await ViewConfirmationService(event.id)

      expect(result).toEqual({
        activeNavBar: 'notices',
        forwardLink: `/system/notices/${event.id}`,
        monitoringStationLink: null,
        pageTitle: 'Returns invitations sent',
        referenceCode
      })
    })
  })
})
