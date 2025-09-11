
{#
Copyright (c) 2025-present Snowplow Analytics Ltd. All rights reserved.
This program is licensed to you under the Snowplow Personal and Academic License Version 1.0,
and you may not use this file except in compliance with the Snowplow Personal and Academic License Version 1.0.
You may obtain a copy of the Snowplow Personal and Academic License Version 1.0 at https://docs.snowplow.io/personal-and-academic-license-1.0/
#}

{{ config(
   post_hook=["{{snowplow_utils.print_run_limits(this, 'user_activity_1')}}"],
   sql_header=snowplow_utils.set_query_tag(var('snowplow__query_tag', 'snowplow_dbt'))
   )
}}


{%- set models_in_run = snowplow_utils.get_enabled_snowplow_models('user_activity_1', base_events_table_name='user_activity_1_snowplow_base_events_this_run') -%}

{% set min_first_processed_load_tstamp,
      max_first_processed_load_tstamp,
      min_last_processed_load_tstamp,
      max_last_processed_load_tstamp,
      models_matched_from_manifest,
      sync_count,
      has_matched_all_models = snowplow_utils.get_incremental_manifest_status_t(ref('user_activity_1_incremental_manifest'),
                                                                                 models_in_run) -%}

{% set run_limits_query = snowplow_utils.get_run_limits_t(min_first_processed_load_tstamp,
                                                         max_first_processed_load_tstamp,
                                                         min_last_processed_load_tstamp,
                                                         max_last_processed_load_tstamp,
                                                         models_matched_from_manifest,
                                                         sync_count,
                                                         has_matched_all_models,
                                                         var("snowplow__start_date","2024-01-01")) -%}

{{ run_limits_query }}
