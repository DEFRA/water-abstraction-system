'use strict'

/**
 * A combined logging and Airbrake (Errbit) notification manager
 * @module RequestNotifierLib
 */

const BaseNotifierLib = require('./base-notifier.lib.js')

/**
 * A combined logging and Airbrake (Errbit) notification manager for actions that take place within a
 * {@link https://hapi.dev/api/?v=20.1.2#request|Hapi request}
 *
 * This is used in conjunction with the `RequestNotifierPlugin` to make both logging via
 * {@link https://github.com/pinojs/pino|pino} and sending notifications to Errbit via
 * {@link https://github.com/airbrake/airbrake-js|airbrake-js} available to our controllers and their underlying
 * services.
 *
 * This extends the `BaseNotifierLib` to also ensure the request ID is included in all output. We can then identify all
 * related log entries and Errbit notifications by using the ID.
 */
class RequestNotifierLib extends BaseNotifierLib {
  // eslint-disable-next-line jsdoc/lines-before-block
  /**
   * Instantiate a new instance
   *
   * @param {string} id - The request ID taken from a {@link https://hapi.dev/api/?v=20.1.2#request|Hapi request}
   * instance. Used to link notifications to the requests that generated them
   * @param {object} logger - An instance of {@link https://github.com/pinojs/pino|pino}, a Node JSON logger
   * which the {@link https://github.com/pinojs/hapi-pino|hapi-pino} plugin adds to Hapi
   * @param {object} notifier - An instance of the {@link https://github.com/airbrake/airbrake-js|airbrake-js} `notify()`
   * method which our 'AirbrakePlugin` adds to Hapi
   */
  constructor(id, logger, notifier) {
    super(logger, notifier)
    this._id = id
  }

  /**
   * Override the base class's _formatLogPacket to decorate the data object with the request ID
   *
   * We don't just want the log output to include the request ID. We want it to output it in the same structure as the
   * Hapi request is logged, for example
   *
   * ```
   * req: {
   *   "id": "1617655289640:533c1e381364:1671:kn526tbx:10000",
   *   ...
   * ```
   *
   * This means we can then locate all log entries for a specific request in AWS Cloudwatch by using
   * {@link https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html|Metric Filters}
   *
   * ```
   * { $.req.id = "1617655289640:533c1e381364:1671:kn526tbx:10000" }
   * ```
   *
   * @private
   */
  _formatLogPacket(data, error) {
    const dataWithRequestId = {
      ...data,
      req: {
        id: this._id
      }
    }

    return super._formatLogPacket(dataWithRequestId, error)
  }

  /**
   * Override the base class's _formatNotifyPacket to decorate the data object with the request ID
   *
   * We add the request ID so we can tie the Errbit entry back to the original request that raised the notification
   *
   * This means we can then locate the request in the log entries in AWS Cloudwatch by using
   * {@link https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html|Metric Filters}
   *
   * ```
   * { $.req.id = "1617655289640:533c1e381364:1671:kn526tbx:10000" }
   * ```
   *
   * @private
   */
  _formatNotifyPacket(data, error, message) {
    const dataWithRequestId = {
      ...data,
      req: {
        id: this._id
      }
    }

    return super._formatNotifyPacket(dataWithRequestId, error, message)
  }
}

module.exports = RequestNotifierLib
