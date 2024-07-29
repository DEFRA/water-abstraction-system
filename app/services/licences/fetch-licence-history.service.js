'use strict'

const { db } = require('../../../db/db.js')
const { ref } = require('objection')

const LicenceModel = require('../../models/licence.model.js')

async function go (licenceId) {
  const licence = await _fetchLicence(licenceId)
  const results = await _fetchEntries(licenceId)

  console.log('🚀🚀🚀 ~ results:', results)

  const testEntries2 = await _fetchEntries2(licenceId)

  console.log('🚀🚀🚀 ~ testEntries2:', testEntries2.chargeVersions)

  return {
    entries: results.rows,
    licence
  }
}

async function _fetchLicence (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'licenceRef',
      'createdAt'
    ])
}

async function _fetchEntries2 (licenceId) {
  const licenceEntries = LicenceModel.query()
    .findById(licenceId)
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (builder) => {
      builder
        .select(
          'licenceVersions.licenceId as licenceId',
          db.raw("'licence-version' as entryType"),
          'licenceVersions.id as entry_id',
          db.raw("'' as reason"),
          db.raw("'' as createdBy"),
          db.raw("'' as note"),
          'issue as version_number'
        )
        .orderBy([
          { column: 'createdAt', order: 'desc' },
          { column: 'issue', order: 'desc' }
        ])
    })
    .withGraphFetched('chargeVersions')
    .modifyGraph('chargeVersions', (builder) => {
      builder
        .select(
          'chargeVersions.licenceId as licence_id',
          'water.notes.text as note',
          'water.changeReasons.description as reason',
          'chargeVersions.id as entry_id',
          'createdAt as created_at',
          'versionNumber as version_number',
          ref('createdBy:email').castText().as('created_by')
        )
        .leftJoin('water.notes', 'notes.noteId', '=', 'chargeVersions.noteId')
        .leftJoin('water.changeReasons', 'changeReasons.changeReasonId', '=', 'chargeVersions.changeReasonId')
        .orderBy([
          { column: 'chargeVersions.createdAt', order: 'desc' },
          { column: 'chargeVersions.versionNumber', order: 'desc' }
        ])
    })
    .withGraphFetched('returnVersions')
    .modifyGraph('returnVersions', (builder) => {
      builder.orderBy([
        { column: 'createdAt', order: 'desc' },
        { column: 'version', order: 'desc' }
      ])
    })

  return licenceEntries
}

async function _fetchEntries (licenceId) {
  return db.raw(`
    SELECT
  *
FROM (
  SELECT
    l.id AS licence_id,
    'licence-version' AS entry_type,
    lv.id AS entry_id,
    '' AS reason,
    lv.created_at,
    '' AS created_by,
    '' AS note,
    lv.issue AS version_number
  FROM
    public.licences l
  INNER JOIN public.licence_versions lv ON lv.licence_id = l.id
  WHERE
    l.licence_ref = '01/117'
  UNION ALL
  SELECT
    l.id AS licence_id,
    'charge-version' AS entry_type,
    cv.id AS entry_id,
    cr.description AS reason,
    cv.created_at,
    cv.created_by->>'email' AS created_by,
    cvn."text" AS note,
    cv.version_number
  FROM
    public.licences l
  INNER JOIN public.charge_versions cv ON cv.licence_id = l.id
  INNER JOIN public.change_reasons cr ON cr.id = cv.change_reason_id
  LEFT JOIN water.notes cvn ON cvn.type_id = cv.id
  WHERE
    l.id = ?
  UNION ALL
  SELECT
    l.id AS licence_id,
    'return-version' AS entry_type,
    rv.id AS entry_id,
    rv.reason,
    rv.created_at,
    u.username AS created_by,
    rv.notes AS note,
    rv.VERSION AS version_number
  FROM
    public.licences l
  INNER JOIN public.return_versions rv ON rv.licence_id = l.id
  LEFT JOIN public.users u ON u.id = rv.created_by
  WHERE
    l.id = ?
) entries
ORDER BY entries.created_at DESC, entries.version_number DESC;`,
  [licenceId, licenceId])
}

module.exports = {
  go
}
