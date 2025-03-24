# CHANGELOG
## Unreleased
- Add missing keys for `migrations`, `login`, `addressenregister` and `jobs-controller`. [DL-6490]
- Reorganize delta consumers config to harmonize with the ecosystem

### Deploy Notes
```
drc up -d migrations login addressenregister jobs-controller op-consumer
```