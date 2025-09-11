
{#
Copyright (c) 2023-present Snowplow Analytics Ltd. All rights reserved.
This program is licensed to you under the Snowplow Personal and Academic License Version 1.0,
and you may not use this file except in compliance with the Snowplow Personal and Academic License Version 1.0.
You may obtain a copy of the Snowplow Personal and Academic License Version 1.0 at https://docs.snowplow.io/personal-and-academic-license-1.0/
#}

{{
    config(
        materialized='table',
        tags=['snowplow_batch_engine', 'dates_to_process'],
        sql_header=snowplow_utils.set_query_tag(var('snowplow__query_tag', 'snowplow_dbt')),
        post_hook=[
            "{{ snowplow_utils.print_dates_to_process() }}"
        ]
    )
}}

{% set dates_to_process_query = snowplow_utils.get_dates_to_process(
    'user_activity_1_filtered_events_this_run',
    'user_activity_1_daily_aggregation_manifest'
) %}

{{ dates_to_process_query }}
