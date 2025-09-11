
{#
Copyright (c) 2025-present Snowplow Analytics Ltd. All rights reserved.
This program is licensed to you under the Snowplow Personal and Academic License Version 1.0,
and you may not use this file except in compliance with the Snowplow Personal and Academic License Version 1.0.
You may obtain a copy of the Snowplow Personal and Academic License Version 1.0 at https://docs.snowplow.io/personal-and-academic-license-1.0/
#}

{{
  config(
    materialized='incremental',
    sort='event_date',
    dist='attribute_key',
    partition_by = snowplow_utils.get_value_by_target_type(bigquery_val = {
      "field": "event_date",
      "data_type": "date"
    }, databricks_val='event_date'),
    unique_key='attribute_key_date_id',
    upsert_date_key='event_date',
    tags=["derived"],
    on_schema_change='append_new_columns',
    cluster_by=snowplow_utils.get_value_by_target_type(bigquery_val=["event_date","attribute_key"], snowflake_val=["event_date"]),
    sql_header=snowplow_utils.set_query_tag(var('snowplow__query_tag', 'snowplow_dbt')),
    tblproperties={
      'delta.autoOptimize.optimizeWrite' : 'true',
      'delta.autoOptimize.autoCompact' : 'true'
    },
    snowplow_optimize = true
  )
}}

select * from
{{ ref('user_activity_1_daily_aggregates_this_run') }}
