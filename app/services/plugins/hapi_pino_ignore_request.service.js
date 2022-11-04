'use strict'

/**
 * @module HapiPinoIgnoreRequestService
 */

class HapiPinoIgnoreRequestService {
  /**
   * Returns true or false whether a request should be loged
   *
   * Used by `app/plugins/hapi_pino.plugin.js` to control what does and doesn't get added to our log output. We built
   * `/status` to support AWS load balancer health checks which fire approximately every 500ms. If we logged these
   * requests our log would be too noisy to prove useful. (`/` and `/status` go to the same place hence both are
   * listed).
   *
   * When a view is requested, a number of assets will be requested along with it. So, a single request for a page will
   * result in the following log entries
   *
   * ```text
   * [09:41:06.763] INFO (17542): [response] get /service-status 200 (1138ms)
   * [09:41:06.871] INFO (17542): [response] get /assets/stylesheets/application.css 200 (72ms)
   * [09:41:06.873] INFO (17542): [response] get /assets/all.js 200 (64ms)
   * [09:41:06.893] INFO (17542): [response] get /assets/images/govuk-crest.png 200 (8ms)
   * [09:41:06.926] INFO (17542): [response] get /assets/fonts/light-94a07e06a1-v2.woff2 200 (19ms)
   * [09:41:06.928] INFO (17542): [response] get /assets/fonts/bold-b542beb274-v2.woff2 200 (18ms)
   * [09:41:07.032] INFO (17542): [response] get /assets/images/favicon.ico 200 (6ms)
   * ```
   *
   * And these are just the first line from each entry. Because we log both the request and response details when
   * viewed locally each entry is 41 lines long!
   *
   * So, we also do not log any requests to `/assets/*`.
   *
   * @param {Object} _options The options passed to the HapiPino plugin
   * @param {request} request Hapi request object created internally for each incoming request
   *
   * @returns {boolean} true if the request should be ignored, else false
   */
  static go(_options, request) {
    const staticPaths =  ['/', '/status']

    const result = staticPaths.includes(request.path) || request.path.startsWith('/assets')

    return result
  }
}

module.exports = HapiPinoIgnoreRequestService
