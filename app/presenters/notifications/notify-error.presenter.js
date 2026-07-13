/**
 * Formats a notification which has errored
 * @module NotifyErrorPresenter
 */

/**
 * Formats a notification which has errored
 *
 * This function provides a consistent format for an errored notification.
 *
 * @param {string} statusCode - the status code of the error
 * @param {string} message - the main error message
 * @param {any[]} errors - could be any errors with any data type
 *
 * @returns {object} the notification error data
 */
export default function (statusCode, message, errors) {
  return {
    notifyError: JSON.stringify({
      status: statusCode,
      message,
      errors
    }),
    status: 'error'
  }
}
