'use strict'

const { notifyTemplates } = require('../../app/lib/notify-templates.lib.js')

/**
 * Represents a successful response from the Notify API
 *
 * @param {string} referenceCode - the unique generated reference code
 *
 * @returns {object} an object representing the successful response from the Notify API
 */
function successfulResponse(referenceCode) {
  return {
    email: {
      succeeded: true,
      response: {
        statusCode: 200,
        body: {
          content: {
            body: 'Dear licence holder,\r\n',
            from_email: 'environment.agency.water.resources.licensing.service@notifications.service.gov.uk',
            one_click_unsubscribe_url: null,
            subject: 'Submit your water abstraction returns by 28th April 2025'
          },
          id: '9a0a0ba0-9dc7-4322-9a68-cb370220d0c9',
          reference: referenceCode,
          scheduled_for: null,
          template: {
            id: notifyTemplates.standard.invitations.returnsAgentEmail,
            uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${notifyTemplates.standard.invitations.returnsAgentEmail}`,
            version: 40
          },
          uri: 'https://api.notifications.service.gov.uk/v2/notifications/9a0a0ba0-9dc7-4322-9a68-cb370220d0c9'
        }
      }
    },
    letter: {
      succeeded: true,
      response: {
        statusCode: 200,
        body: {
          content: {
            body: 'Dear Licence holder,\r\n',
            subject: 'Submit your water abstraction returns by 28th April 2025'
          },
          id: 'fff6c2a9-77fc-4553-8265-546109a45044',
          reference: referenceCode,
          scheduled_for: null,
          template: {
            id: notifyTemplates.standard.invitations.licenceHolderLetter,
            uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${notifyTemplates.standard.invitations.licenceHolderLetter}`,
            version: 32
          },
          uri: 'https://api.notifications.service.gov.uk/v2/notifications/fff6c2a9-77fc-4553-8265-546109a45044'
        }
      }
    },
    pdf: {
      succeeded: true,
      response: {
        statusCode: 200,
        body: {
          id: 'fff6c2a9-77fc-4553-8265-546109a45044',
          reference: referenceCode
        }
      }
    }
  }
}

module.exports = {
  successfulResponse
}
