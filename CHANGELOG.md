# CHANGELOG
## Unreleased
- Add missing keys for `migrations`, `login`, `addressenregister` and `jobs-controller`. [DL-6490]
- Reorganize delta consumers config to harmonize with the ecosystem
- Backend refactoring [CLBV-980]

### Deploy Notes
```
drc down
cp -r data copy-data-2025-xx-xx
rm -rf data
drc up -d virtuoso migrations
# wait for end of migrations
drc up -d database op-consumer
# wait for end of initial sync of the op consumer
drc up -d
```