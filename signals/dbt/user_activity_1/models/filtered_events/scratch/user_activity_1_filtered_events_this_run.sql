{#
Copyright (c) 2025-present Snowplow Analytics Ltd. All rights reserved.
This program is licensed to you under the Snowplow Personal and Academic License Version 1.0,
and you may not use this file except in compliance with the Snowplow Personal and Academic License Version 1.0.
You may obtain a copy of the Snowplow Personal and Academic License Version 1.0 at https://docs.snowplow.io/personal-and-academic-license-1.0/
#}

{{
    config(
        tags=["this_run"],
        materialized="table",
        sql_header=snowplow_utils.set_query_tag(var('snowplow__query_tag', 'snowplow_dbt'))
    )
}}

with prep as (

    select
        event_id,
        {{ var('snowplow__attribute_key', 'domain_userid') }} as attribute_key,
        derived_tstamp,
        date(derived_tstamp) as event_date,
        load_tstamp,
        event_name,
        
            
                contexts_com_snowplowanalytics_snowplow_ecommerce_transaction_1[0].revenue AS revenue,
        
            
                unstruct_event_com_snowplowanalytics_snowplow_ecommerce_snowplow_ecommerce_action_1:type AS type,
        
            
                contexts_com_snowplowanalytics_snowplow_ecommerce_product_1[0].category AS category
        

    from
        {{ ref('user_activity_1_base_events_this_run') }}
    where 
        (event_name = 'snowplow_ecommerce_action'
            and event_vendor = 'com.snowplowanalytics.snowplow.ecommerce'
            and event_version = '1-0-2'
        )

    
        
        and {{ snowplow_utils.is_run_with_new_events("user_activity_1"
            , new_event_limits_table="user_activity_1_base_new_event_limits"
            , incremental_manifest_table="user_activity_1_incremental_manifest"
            , base_sessions_lifecycle_table="user_activity_1_base_sessions_lifecycle"
            ) }}

)

select
    *,
    {{ dbt_utils.generate_surrogate_key(['attribute_key', 'event_date']) }} AS attribute_key_date_id
from prep

    
