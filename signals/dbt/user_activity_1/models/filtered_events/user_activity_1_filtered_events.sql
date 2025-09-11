
{#
Copyright (c) 2025-present Snowplow Analytics Ltd. All rights reserved.
This program is licensed to you under the Snowplow Personal and Academic License Version 1.0,
and you may not use this file except in compliance with the Snowplow Personal and Academic License Version 1.0.
You may obtain a copy of the Snowplow Personal and Academic License Version 1.0 at https://docs.snowplow.io/personal-and-academic-license-1.0/
#}
{{ config(
    materialized = "incremental",
    unique_key = "event_id",
    upsert_date_key = "derived_tstamp",
    partition_by = snowplow_utils.get_value_by_target_type(
        bigquery_val={
        "field": "derived_tstamp",
        "data_type": "timestamp"
    }, 
    databricks_val='derived_tstamp_date'),
    sql_header=snowplow_utils.set_query_tag(var('snowplow__query_tag', 'snowplow_dbt')),
    tblproperties={
      'delta.autoOptimize.optimizeWrite' : 'true',
      'delta.autoOptimize.autoCompact' : 'true'
    },
    snowplow_optimize=true
) }}

select *
    
from {{ ref('user_activity_1_filtered_events_this_run') }}
where {{ snowplow_utils.is_run_with_new_events("user_activity_1"
        , new_event_limits_table="user_activity_1_base_new_event_limits"
        , incremental_manifest_table="user_activity_1_incremental_manifest"
        , base_sessions_lifecycle_table="user_activity_1_base_sessions_lifecycle"
        ) }}
