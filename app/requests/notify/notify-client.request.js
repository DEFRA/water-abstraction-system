'use strict'

/**
 * Creates a Notify Client
 * @module NotifyClientRequest
 */

const NotifyClient = require('notifications-node-client').NotifyClient
const axios = require('axios')

const { HttpsProxyAgent } = require('hpagent')

const NotifyConfig = require('../../../config/notify.config.js')
const RequestConfig = require('../../../config/request.config.js')

/**
 * Creates a Notify Client
 *
 * Returns an instance of {@link https://github.com/alphagov/notifications-node-client | notifications-node-client}
 * configured to work in environments with and without proxy servers.
 *
 * Running locally just instantiating the NotifyClient was all we had to do. But when deployed to our AWS environments
 * which use the {@link https://www.squid-cache.org/ | Squid proxy server} it failed.
 *
 * Initially, we followed the
 * {@link https://docs.notifications.service.gov.uk/node.html#connect-through-a-proxy-optional | Notify documentation}
 * but all we saw was the following returned by **Squid**.
 *
 * ```text
 * This proxy and the remote host failed to negotiate a mutually acceptable security settings for handling your request.
 * It is possible that the remote host does not support secure connections, or the proxy is not satisfied with the host
 * security credentials.
 * ```
 *
 * It appears this is a {@link https://github.com/axios/axios/issues/6320 | known issue with Axios} and how it sends
 * data via the proxy. Most workarounds suggest that you need to tell Axios to disable its proxy, and specify
 * a https agent instead.
 *
 * We use {@link https://www.npmjs.com/package/hpagent | hpagent} to set the agent, we have to create our own custom
 * instance of Axios and tell Notify to use it instead.
 *
 * @private
 */
function go() {
  const notifyClient = new NotifyClient(NotifyConfig.apiKey)
  const proxy = RequestConfig.httpProxy

  if (proxy) {
    const agent = new HttpsProxyAgent({ proxy })
    const axiosInstance = axios.create({
      proxy: false,
      httpsAgent: agent
    })

    notifyClient.setClient(axiosInstance)
  }

  return notifyClient
}

module.exports = {
  go
}
