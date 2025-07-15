'use strict'

/**
 * Model for sessions
 * @module SessionModel
 */

const BaseModel = require('./base.model.js')

/**
 * Used for managing temporary session data, for example, during set up journeys
 *
 * > IMPORTANT! Do use the following properties in `data:`; `id`, `createdAt` or `updatedAt`.
 * >
 * > This model includes functionality to elevate the properties of `data` onto the instance when fetched. But if `data`
 * > contains these properties they will override the existing properties of the session instance.
 */
class SessionModel extends BaseModel {
  static get tableName() {
    return 'sessions'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes() {
    return ['data']
  }

  /**
   * Called after a session instance is fetched. It elevates the properties of `data` to the top level of the instance
   *
   * > We do not expect modules to call this function directly. It is a named hook for use with Objection.js
   *
   * The session table, excluding `id` and the timestamps, only contains one field; `data`. It is a JSONB field so
   * it is flexible enough to hold whatever data an individual needs.
   *
   * To improve working with the session and avoid callers having to do _everything_ via `session.data` we use this
   * `$afterFind()` hook to elevate the properties of `.data` to the top level of the instance.
   *
   * So, if `session.data` contained `{ reason: 'major-change' }` after a caller fetched the session instance they would
   * be able to call and update `session.reason` instead.
   *
   * We think this makes working with the `SessionModel` the same as working with the normal, structured model
   * instances.
   *
   * @param {object} _queryContext - Objection.js query context which we do not use
   */
  $afterFind(_queryContext) {
    for (const [key, value] of Object.entries(this.data)) {
      this[key] = value
    }
  }

  /**
   * Called after a session instance is created. It calls $afterFind() to elevate the properties of `data` to the top
   * level of the instance
   *
   * > We do not expect modules to call this function directly. It is a named hook for use with Objection.js
   *
   * Because we usually fetch a session within code rather than create one, this is most likely to be of use within unit
   * tests; if we create a session with specific data in a unit test and then wish to refer to that data we can directly
   * refer to it at the top level of `session` instead of within `session.data`, allowing us to be consistent with how
   * we would refer to the session properties within code.
   *
   * @param {object} _queryContext - Objection.js query context which we do not use
   */
  $afterInsert(_queryContext) {
    this.$afterFind()
  }

  /**
   * Update the session instance's `data` property with the current properties of the instance
   *
   * Added to avoid callers having to repeatedly implement this pattern.
   *
   * ```javascript
   * const currentData = session.data
   * currentData.reason = payload.reason
   * await session.$query().patch({ data: currentData })
   * ```
   *
   * Now callers can just do the following.
   *
   * ```javascript
   * session.reason = payload.reason
   * session.$update()
   * ```
   *
   * Ignoring `id` and the timestamps, this method extracts all the other properties on the instance into an object
   * then calls `patch({ data: currentData })`, saving calling modules the trouble!
   *
   * @returns {Promise<number>} - the number of affected rows. In our case this will always be 1!
   */
  async $update() {
    const { id, createdAt, data, updatedAt, ...currentData } = this

    return this.$query().patch({ data: currentData })
  }
}

module.exports = SessionModel
