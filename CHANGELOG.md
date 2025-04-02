# CHANGELOG
## Unreleased
- Add missing keys for `migrations`, `login`, `addressenregister` and `jobs-controller`. [DL-6490]
- Reorganize delta consumers config to harmonize with the ecosystem
- Backend refactoring [CLBV-980]

### Deploy Notes

Make sure the docker-compose.override.yml contains the following:
```
services:
  op-consumer:
    environment:
      DCR_SYNC_BASE_URL: "https://dev.organisaties.abb.lblod.info" # or any other OP environment you're linking to
      DCR_DISABLE_INITIAL_SYNC: "false"
      DCR_DISABLE_DELTA_INGEST: "true"
      DCR_LANDING_ZONE_DATABASE: "virtuoso" # for the initial sync, we go directly to virtuoso
      DCR_REMAPPING_DATABASE: "virtuoso" # for the initial sync, we go directly to virtuoso
```
Then
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

Once the contact-data-dispatcher is done doing the initial dispatch, update the `docker-compose.override.yml` to
```
services:
  op-consumer:
    environment:
      DCR_SYNC_BASE_URL: "https://dev.organisaties.abb.lblod.info" # or any other OP environment you're linking to
      DCR_DISABLE_INITIAL_SYNC: "false"
      DCR_DISABLE_DELTA_INGEST: "false"
```
and
```
drc up -d
```
