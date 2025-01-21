# MODIS-VHI-Analysis
A Google Earth Engine application for monitoring vegetation health in Sudan using MODIS NDVI and LST data. Features automated calculation of VCI, TCI, and VHI indices with interactive visualization and export capabilities. 🛰️🌱
# MODIS-Based Vegetation Health Analysis for Sudan

## Overview
This script processes MODIS satellite data to assess vegetation health conditions across Sudan by integrating:
- NDVI (Normalized Difference Vegetation Index) from MOD13A1 product
- Land Surface Temperature (LST) from MOD11A2 product

## Indices Calculated
1. VCI (Vegetation Condition Index)
   - Normalizes NDVI to assess relative vegetation changes
   - Range: 0-100%

2. TCI (Temperature Condition Index)
   - Evaluates temperature stress impact
   - Converts LST from Kelvin to Celsius
   - Range: 0-100%

3. VHI (Vegetation Health Index)
   - Combined measure of vegetation and temperature conditions
   - Equal weights of VCI and TCI
   - Range: 0-100%

## Features
- Automated data processing for year 2000
- Custom visualization with interactive legend
- Color-coded output (blue to red palette)
- Export functionality to Google Drive
- AOI-specific analysis for Sudan

## Class Ranges
- 0-25: Low vegetation health
- 26-50: Moderate vegetation health
- 51-75: High vegetation health
- 76-100: Very high vegetation health

Would you like me to expand on any of these aspects or add additional technical details?
