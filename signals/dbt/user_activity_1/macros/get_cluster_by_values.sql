{#
Copyright (c) 2025-present Snowplow Analytics Ltd. All rights reserved.
This program is licensed to you under the Snowplow Personal and Academic License Version 1.0,
and you may not use this file except in compliance with the Snowplow Personal and Academic License Version 1.0.
You may obtain a copy of the Snowplow Personal and Academic License Version 1.0 at https://docs.snowplow.io/personal-and-academic-license-1.0/
#}

{% macro get_cluster_by_values(model) %}
    {{ return(adapter.dispatch('get_cluster_by_values', 'user_activity_1')(model)) }}
{% endmacro %}


{% macro default__get_cluster_by_values(model) %}
    {% if model == 'dummy' %}
        {{ return(snowplow_utils.get_value_by_target_type(bigquery_val=["session_identifier"], snowflake_val=["to_date(start_tstamp)"])) }}
    {% else %}
        {{ exceptions.raise_compiler_error(
      "Snowplow Error: Model "~model~" not defined for cluster by."
      ) }}
    {% endif %}
{% endmacro %}
