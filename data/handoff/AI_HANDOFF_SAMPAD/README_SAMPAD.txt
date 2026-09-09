
SIH26162 - AI/ML HANDOFF
========================

Project:
AI-Based Detection and Classification of Industrial Fires
and Persistent Thermal Sources Using NASA FIRMS, OSM &
Satellite Data.

Prepared by:
Sourav Kar
RS & GIS Lead

Handoff to:
Sampad Roy
AI/ML Lead


DATASET
=======

AI_MODEL_INPUT.csv
------------------

This file contains the main numerical features recommended
for AI/ML classification.

Number of expected events:
202

Main feature groups:

1. FIRMS thermal features
   - bright_ti4
   - bright_ti5
   - frp
   - confidence
   - scan
   - track

2. Temporal feature
   - daynight

3. Industrial proximity
   - nearest_industry_distance_m
   - industries_within_500m
   - industries_within_1km
   - industries_within_2km

4. Sentinel-2 features
   - NDVI
   - NDBI
   - NDWI


EVENT_METADATA.csv
------------------

This file contains event/location/context information
for interpretation, reporting and dashboard use.

It should NOT be treated as the primary numerical ML
feature table.


IMPORTANT
=========

The current dataset contains FEATURES, not supervised
classification labels.

Required target classes for the AI model:

1. Industrial Fire
2. Gas Flare
3. Persistent Industrial Heat
4. Other Thermal Source

Labels should be created/validated separately by the
AI/ML and Data/Validation team.


RS/GIS PIPELINE COMPLETED
=========================

NASA FIRMS
    ->
OSM industrial context
    ->
Spatial proximity analysis
    ->
Persistence analysis
    ->
Sentinel-2 NDVI/NDBI/NDWI
    ->
AI-ready feature dataset


ORIGINAL DATASET
================

outputs/ai_features_final.csv

The original dataset should be preserved and not modified.
