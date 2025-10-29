'use strict'

const FIFTEEN_MINUTES_IN_MILLISECONDS = 15 * 60 * 1000

/**
 * Plugin to add {@link https://hapi.dev/module/yar/ | yar}, a hapi session manager to the app
 *
 * > TL;DR; we only use the `wrlsSession` we create with **yar** for 'flash' values in support of banner notifications.
 *
 * ## What we don't use yar for
 *
 * There are times we need to persist state across multiple browser requests. A common reason is when you need to take
 * users through a journey before committing the change, for example, setting up a bill run.
 *
 * We _do not_ intend to use **yar** in these situations. We persist journeys using our `SessionModel` (check out
 * `app/controllers/bill-runs-setup.controller.js` for an example). Most session managers like **yar** rely on creating
 * a cookie. This will hold a session ID. Out-of-the-box they will also support you adding the rest of your session data
 * to the cookie. But as it is common to 'blow' the cookie with too much data they will also support working with
 * server-side storage.
 *
 * The legacy code uses Yar in conjunction with {@link https://hapi.dev/module/catbox-redis/ | catbox-redis} to store
 * session data in {@link https://redis.io/ | Redis} (the ID in the session is the ID for the record in Redis!) That's
 * perfect for high volume sites and to be fair is considered 'the norm'. But it adds cost and complexity to our project
 * that we just do not need. Hence we save 'journey' data to our PostgreSQL DB in the `sessions` table and only use the
 * **yar** cookie to support temporary notification banners.
 *
 * ## What we do use yar for
 *
 * The other need for a session manager is when you want to display a one-off notification banner to a user. For
 * example, they've performed an action that has resulted in a change to the record.
 *
 * - A licence review is currently not 'in progress'
 * - The user clicks the 'Mark progress' button. This sends a POST request
 * - The server updates the licence review to 'in progress' and redirects to the licence review page (as per the
 * {@link https://www.geeksforgeeks.org/post-redirect-get-prg-design-pattern/ | PRG pattern})
 * - The redirect causes a GET request which results in the server getting the updated record
 * - The licence review is displayed to the user
 *
 * In this situation we want to display a banner to the user confirming a change was just made. The problem is there is
 * nothing to tell the GET request that this is so. We could do the following
 *
 * - **Don't redirect but respond directly from the POST** - This breaks PRG which you'll see if you hit refresh. The
 * browser will resend your POST request which might have unintended consequences
 * - **Set a flag in the DB** - You then have to add logic to the GET request to update the record and remove the flag.
 * It is also storing something in the DB that we only care about from a UI/behaviour context
 * - **Add a query string param** - This can be seen by the user and feels a bit 'ick'. Also, it could be abused. There
 * is nothing to stop users adding the flag themselves to force the banner to appear. It also won't clear when the
 * browser is refreshed.
 *
 * We're not the first to encounter this problem. Hence why session cookies and **yar** exist. **yar** even has a
 * feature specific to this use case.
 *
 * - In the POST request call `request.yar.flash('banner', 'This licence has been marked.')
 * - In the GET request call `const [bannerMessage] = request.yar.flash('banner')`
 *
 * **yar** will store the message in the `wrlsSession` cookie. The call in the GET not only retrieves the value it also
 * tell's Yar to delete it from the cookie. If the user hits refresh the second GET will find `banner` is `null`.
 *
 * ## Multiple sessions
 *
 * Unfortunately, adding Yar to our service means there are now two session cookies. The legacy project being first
 * means it gets dibs on the default name 'session'. We did try to reuse the 'session' cookie. Unfortunately, you tell
 * Yar to use the server's cache instead of the cookie by setting its size to 0. This is how the legacy code has
 * configured it which means any calls to `set()` or `flash()` result in nothing being persisted.
 *
 * So, we create our own 'wrlsSession' cookie. The upside is we're not bound by the legacy cookie and when the time
 * comes can drop it completely without additional work or adverse effects on the user.
 *
 * @module YarPlugin
 */

const Yar = require('@hapi/yar')

const AuthenticationConfig = require('../../config/authentication.config.js')

const YarPlugin = {
  plugin: Yar,
  options: {
    cookieOptions: {
      password: AuthenticationConfig.password,
      // After fifteen minutes of inactivity our session will expire. Any filters or other data saved to the session
      // will disappear. We keep it alive by 'touching' it on every request, which resets the TTL. See the
      // `SessionPlugin` for more details.
      ttl: FIFTEEN_MINUTES_IN_MILLISECONDS
    },
    name: 'wrlsSession'
  }
}

module.exports = YarPlugin
