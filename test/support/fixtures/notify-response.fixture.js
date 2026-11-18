import http2 from 'node:http2'
import { NOTIFY_TEMPLATES } from 'water-abstraction-engine/lib/notify-templates.lib.js'

const { HTTP_STATUS_OK } = http2.constants

/**
 * Represents a successful response from the Notify API to sending an email notification
 *
 * @param {string} referenceCode - the unique generated reference code
 *
 * @returns {object} an object representing the successful response from the Notify API
 */
function sendEmailSuccessfulResponse(referenceCode) {
  return {
    response: {
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
          id: NOTIFY_TEMPLATES.invitations.standard.email['returns user'],
          uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${NOTIFY_TEMPLATES.invitations.standard.email['returns user']}`,
          version: 40
        },
        uri: 'https://api.notifications.service.gov.uk/v2/notifications/9a0a0ba0-9dc7-4322-9a68-cb370220d0c9'
      },
      statusCode: HTTP_STATUS_OK
    },
    succeeded: true
  }
}

/**
 * Represents an error response from the Notify API for a send notification request
 *
 * > This and `statusErrorResponse()` are essentially the same. However, the error messages they contain reflect the
 * > different request types to give a more realistic test response.
 *
 * @param {number} [statusCode=400] - the HTTP status code to use for the error response
 *
 * @returns {object} an object representing the error response from the Notify API
 */
function sendErrorResponse(statusCode = 400) {
  return {
    response: {
      body: {
        errors: [
          {
            error: 'BadRequestError',
            message: 'Missing personalisation: returnDueDate'
          }
        ],
        status_code: statusCode
      },
      statusCode
    },
    succeeded: false
  }
}

/**
 * Represents a successful response from the Notify API to sending a letter notification
 *
 * @param {string} referenceCode - the unique generated reference code
 *
 * @returns {object} an object representing the successful response from the Notify API
 */
function sendLetterSuccessfulResponse(referenceCode) {
  return {
    response: {
      body: {
        content: {
          body: 'Dear Licence holder,\r\n',
          subject: 'Submit your water abstraction returns by 28th April 2025'
        },
        id: 'fff6c2a9-77fc-4553-8265-546109a45044',
        reference: referenceCode,
        scheduled_for: null,
        template: {
          id: NOTIFY_TEMPLATES.invitations.standard.letter['licence holder'],
          uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${NOTIFY_TEMPLATES.invitations.standard.letter['licence holder']}`,
          version: 32
        },
        uri: 'https://api.notifications.service.gov.uk/v2/notifications/fff6c2a9-77fc-4553-8265-546109a45044'
      },
      statusCode: HTTP_STATUS_OK
    },
    succeeded: true
  }
}

/**
 * Represents a successful response from the Notify API to sending a PDF notification
 *
 * @param {string} referenceCode - the unique generated reference code
 *
 * @returns {object} an object representing the successful response from the Notify API
 */
function sendPdfSuccessfulResponse(referenceCode) {
  return {
    response: {
      body: {
        id: 'fff6c2a9-77fc-4553-8265-546109a45044',
        reference: referenceCode
      },
      statusCode: HTTP_STATUS_OK
    },
    succeeded: true
  }
}

/**
 * Represents an error response from the Notify API for a status request
 *
 * > This and `sendErrorResponse()` are essentially the same. However, the error messages they contain reflect the
 * > different request types to give a more realistic test response.
 *
 * @param {number} [statusCode=400] - the HTTP status code to use for the error response
 *
 * @returns {object} an object representing the error response from the Notify API
 */
function statusErrorResponse(statusCode = 400) {
  return {
    response: {
      body: {
        errors: [
          {
            error: 'ValidationError',
            message: 'notification_id is not a valid UUID'
          }
        ],
        status_code: statusCode
      },
      statusCode
    },
    succeeded: false
  }
}

/**
 * Represents a successful response from the Notify API to requesting the status of an email notification
 *
 * @param {string} referenceCode - the unique generated reference code
 * @param {string} [notifyStatus='delivered'] - the status of the notification in Notify
 *
 * @returns {object} an object representing the successful response from the Notify API
 */
function statusEmailSuccessfulResponse(referenceCode, notifyStatus = 'delivered') {
  return {
    response: {
      body: {
        body: 'Dear licence contact,\r\n',
        completed_at: '2026-11-11T10:02:49.098868Z',
        cost_details: {},
        cost_in_pounds: 0.0,
        created_at: '2026-11-11T10:02:48.989458Z',
        created_by_name: null,
        email_address: 'carol.shaw@atari.com',
        id: '9949f0e2-da5e-44b9-8897-629dfda098d2',
        is_cost_data_ready: true,
        line_1: null,
        line_2: null,
        line_3: null,
        line_4: null,
        line_5: null,
        line_6: null,
        one_click_unsubscribe_url: null,
        phone_number: null,
        postage: null,
        postcode: null,
        reference: referenceCode,
        scheduled_for: null,
        sent_at: '2026-11-11T10:02:49.049377Z',
        status: notifyStatus,
        subject: 'We have not received your water abstraction returns',
        template: {
          id: 'f1144bc7-8bdc-4e82-87cb-1a6c69445836',
          uri: 'https://api.notifications.service.gov.uk/v2/template/f1144bc7-8bdc-4e82-87cb-1a6c69445836/version/27',
          version: 27
        },
        type: 'email'
      },
      statusCode: HTTP_STATUS_OK
    },
    succeeded: true
  }
}

/**
 * Represents a successful response from the Notify API to requesting the status of a letter notification
 *
 * @param {string} referenceCode - the unique generated reference code
 * @param {string} [notifyStatus='delivered'] - the status of the notification in Notify
 *
 * @returns {object} an object representing the successful response from the Notify API
 */
function statusLetterSuccessfulResponse(referenceCode, notifyStatus = 'received') {
  return {
    response: {
      body: {
        body: 'Dear Licence holder,\r\n',
        completed_at: '2026-11-11T10:02:49.098868Z',
        cost_details: {
          billable_sheets_of_paper: 1,
          postage: 'second'
        },
        cost_in_pounds: 0.73,
        created_at: '2026-11-11T10:02:48.989458Z',
        created_by_name: null,
        email_address: null,
        estimated_delivery: '2026-11-19T16:00:54.818091Z',
        id: '763692a1-26ad-43b0-a133-b03ef115879b',
        is_cost_data_ready: true,
        line_1: 'ENVIRONMENT AGENCY',
        line_2: 'HORIZON HOUSE',
        line_3: 'DEANERY LANE',
        line_4: 'BRISTOL',
        line_5: 'BS1 5AH',
        line_6: null,
        one_click_unsubscribe_url: null,
        phone_number: null,
        postage: 'second',
        postcode: null,
        reference: referenceCode,
        scheduled_for: null,
        sent_at: '2026-11-11T10:02:49.049377Z',
        status: notifyStatus,
        subject: 'We have not received your water abstraction returns',
        template: {
          id: '5d465f69-1c21-4cf0-8bbb-d91c2ba2ec98',
          uri: 'https://api.notifications.service.gov.uk/v2/template/5d465f69-1c21-4cf0-8bbb-d91c2ba2ec98/version/3',
          version: 3
        },
        type: 'letter'
      },
      statusCode: HTTP_STATUS_OK
    },
    succeeded: true
  }
}

/**
 * Represents a successful response from the Notify API to requesting the status of a PDF notification
 *
 * @param {string} referenceCode - the unique generated reference code
 * @param {string} [notifyStatus='delivered'] - the status of the notification in Notify
 *
 * @returns {object} an object representing the successful response from the Notify API
 */
function statusPdfSuccessfulResponse(referenceCode, notifyStatus = 'received') {
  return {
    response: {
      body: {
        body: 'Dear Licence holder,\r\n',
        completed_at: '2026-11-11T10:02:49.098868Z',
        cost_details: {
          billable_sheets_of_paper: 3,
          postage: 'first'
        },
        cost_in_pounds: 1.66,
        created_at: '2026-11-11T10:02:48.989458Z',
        created_by_name: null,
        email_address: null,
        estimated_delivery: '2026-11-19T16:00:54.818091Z',
        id: '33f0c45e-b1c4-424d-8e24-dd4a5b80b1f6',
        is_cost_data_ready: true,
        line_1: 'Provided as PDF',
        line_2: null,
        line_3: null,
        line_4: null,
        line_5: null,
        line_6: null,
        one_click_unsubscribe_url: null,
        phone_number: null,
        postage: 'first',
        postcode: null,
        reference: referenceCode,
        scheduled_for: null,
        sent_at: '2026-11-11T10:02:49.049377Z',
        status: notifyStatus,
        subject: 'Pre-compiled PDF',
        template: {
          id: 'abaecccb-433c-4d25-917a-026f43906d73',
          uri: 'https://api.notifications.service.gov.uk/v2/template/abaecccb-433c-4d25-917a-026f43906d73/version/1',
          version: 1
        },
        type: 'letter'
      },
      statusCode: HTTP_STATUS_OK
    },
    succeeded: true
  }
}

export default {
  sendEmailSuccessfulResponse,
  sendErrorResponse,
  sendLetterSuccessfulResponse,
  sendPdfSuccessfulResponse,
  statusEmailSuccessfulResponse,
  statusErrorResponse,
  statusLetterSuccessfulResponse,
  statusPdfSuccessfulResponse
}
