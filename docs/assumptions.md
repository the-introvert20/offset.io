# Engineering Assumptions & Limitations — offset.io

## Assumptions

1. **Emission Factors**: Based on DEFRA 2023, EPA eGRID 2023, and IPCC 2018 benchmark averages.
2. **Frequency Normalization**: Assumes uniform activity distribution over 365 days / 12 months.
3. **GWP Horizon**: Utilizes GWP100 (100-year Global Warming Potential) carbon dioxide equivalent standard.

## Limitations & Future Extensions

1. **Regional Grids**: Supports US, EU, UK, India, and Global default grids; additional sub-regional grid factors can be managed via Admin API.
2. **AI Provider Interface**: `CarbonCoachService` is designed so an optional external LLM provider can be plugged in later without altering client code.
