{#
Copyright (c) 2025-present Snowplow Analytics Ltd. All rights reserved.
This program is licensed to you under the Snowplow Personal and Academic License Version 1.0,
and you may not use this file except in compliance with the Snowplow Personal and Academic License Version 1.0.
You may obtain a copy of the Snowplow Personal and Academic License Version 1.0 at https://docs.snowplow.io/personal-and-academic-license-1.0/
#}

{{
  config(
    sort='load_tstamp',
    dist='event_id',
    tags=["this_run"]
  )
}}

{% set base_events_query = snowplow_utils.base_create_snowplow_events_this_run_t(
                              run_limits_table='user_activity_1_base_new_event_limits',
                              app_ids=var('snowplow__app_id', []),
                              snowplow_events_database=var('snowplow__database', target.database) if target.type not in ['databricks', 'spark'] else var('snowplow__databricks_catalog', 'hive_metastore') if target.type in ['databricks'] else var('snowplow__atomic_schema', 'atomic'),
                              snowplow_events_schema=var('snowplow__atomic_schema', 'atomic'),
                              snowplow_events_table=var('snowplow__events_table', 'events'),
                              event_names=var('snowplow__events_to_include', []),
                              custom_filter=var('snowplow__custom_filter', none)
                              ) %}

{{ base_events_query }}
