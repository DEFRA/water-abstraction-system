CREATE TABLE IF NOT EXISTS "water”.”point_details” (
  "id" varchar NOT NULL DEFAULT public.gen_random_uuid(),
  "local_name",
  "legacy_id",
  “NGR1_SHEET”,
  “NGR2_SHEET”,
  “NGR3_SHEET”,
  “NGR4_SHEET”,
  “NGR1_EAST”,
  “NGR2_EAST”,
  “NGR3_EAST”,
  “NGR4_EAST”,
  “NGR1_NORTH”,
  “NGR2_NORTH”,
  “NGR3_NORTH”,
  “NGR4_NORTH”,
  PRIMARY KEY (“id”),
);

-- CREATE TABLE IF NOT EXISTS "water”.”purpose_points” (
--   "id" varchar NOT NULL DEFAULT public.gen_random_uuid(),
--   “nald_id” integer NOT NULL,
--   "region_code" integer NOT NULL,
--   “notes” string
--   "date_created" timestamp NOT NULL DEFAULT NOW(),
--   PRIMARY KEY (“id”)
-- );

select
    pp.*,
    row_to_json(m.*) as means_of_abstraction,
    row_to_json(p.*) as point_detail,
    row_to_json(s.*) as point_source
  from
    import."NALD_ABS_PURP_POINTS" pp
      left join import."NALD_MEANS_OF_ABS" m on m."CODE" = pp."AMOA_CODE"
      left join import."NALD_POINTS" p on p."ID" = pp."AAIP_ID"
      left join import."NALD_SOURCES" s on s."CODE" = p."ASRC_CODE"
  where pp."AABP_ID" = $1
  and pp."FGAC_REGION_CODE" = $2
  and p."FGAC_REGION_CODE" = $2;


SELECT external_id from water.licence_version_purpose

INSERT INTO water.”point_details” (
  "local_name",
  "legacy_id",
  “NGR1_SHEET”,
  “NGR2_SHEET”,
  “NGR3_SHEET”,
  “NGR4_SHEET”,
  “NGR1_EAST”,
  “NGR2_EAST”,
  “NGR3_EAST”,
  “NGR4_EAST”,
  “NGR1_NORTH”,
  “NGR2_NORTH”,
  “NGR3_NORTH”,
  “NGR4_NORTH”
)
SELECT
  LOCAL_NAME,
  ID as legacy_id
  NGR1_SHEET,
  NGR2_SHEET,
  NGR3_SHEET,
  NGR4_SHEET,
  NGR1_EAST,
  NGR2_EAST,
  NGR3_EAST,
  NGR4_EAST,
  NGR1_NORTH,
  NGR2_NORTH,
  NGR3_NORTH,
  NGR4_NORTH
FROM NALD_ABS_PURP_POINTS pp
LEFT JOIN import.NALD_POINTS np on np."ID" = pp."AAIP_ID"
WHERE pp."AABP_ID" = split_part(external_id, ‘:’, 2)
AND pp."FGAC_REGION_CODE" = split_part(external_id, ‘:’, 1)




INSERT INTO water.licence_version_purpose (instant_quantity, hourly_quantity, daily_quantity)
SELECT purposes.INST_QTY, purposes.HOURLY_QTY, purposes.DAILY_QTY
FROM import."NALD_ABS_LIC_PURPOSES" purposes
WHERE purposes."AABV_AABL_ID" = split_part(external_id, ‘:’, 2)
AND purposes."FGAC_REGION_CODE" = split_part(external_id, ‘:’, 1)



licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'LOCAL_NAME' AS local_name,
  licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'ID' AS legacy_id,
  licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'NGR1_SHEET' AS NGR1_SHEET,
  licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'NGR2_SHEET' AS NGR2_SHEET,
  licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'NGR3_SHEET' AS NGR3_SHEET,
  licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'NGR4_SHEET' AS NGR4_SHEET,
  licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'NGR1_EAST' AS NGR1_EAST,
  licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'NGR2_EAST' AS NGR2_EAST,
  licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'NGR3_EAST' AS NGR3_EAST,
  licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'NGR4_EAST' AS NGR4_EAST,
  licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'NGR1_NORTH' AS NGR1_NORTH,
  licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'NGR2_NORTH' AS NGR2_NORTH,
  licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'NGR3_NORTH' AS NGR3_NORTH,
  licence_data_value->'data'->'current_version'->'purposes'->0->'purposePoints'->0->'point_detail'->>'NGR4_NORTH' AS NGR4_NORTH
