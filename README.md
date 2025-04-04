# Contact en Organisatie gegevens

For documentation about the CLBV-Application, you can go to: [GitBook Documentation](https://app.gitbook.com/o/-MP9Yduzf5xu7wIebqPG/s/O4tUAyb57Hcu6xbEK2aU/)

## How to set up the stack

When first running the stack, data needs to be consumed by the application from external sources to be fully set-up. For this you'll need to update your `docker-compose.override.yml` as such:
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

You can then start your stack:
```
drc up -d virtuoso migrations
# wait for end of migrations
drc up -d database op-consumer
# wait for end of initial sync of the op consumer
drc up -d
# the contact-data-dispatcher will kick in and dispatch the data from the op-consumer to the correct graphs it should be in
```

Once this is done, you can update your `docker-compose.override.yml` as follows:
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

The live delta sync is now up and the contact-data-dispatcher should be dispatching the updates on the go.

## Mock-login accounts

The service `update-bestuurseenheid-mock-login` will create mock-login accounts for you. Be aware that the first time it runs, as it has to create a lot of accounts, it'll be quite slow and take a lot of resources of your stack, to the point that you will not be able to log in or display any page.

With the current configuration it will run every night at 22h. If you need the accounts created earlier, you can always set `RUN_CRON_ON_START: "true"` and `drc up -d update-bestuurseenheid-mock-login`, or even trigger it via the dedicated endpoint:
```
drc exec update-bestuurseenheid-mock-login curl -X POST http://localhost/heal-mock-logins
```

## Banner message : 

### **How to test the banner message ?**

Always put the environment name in your `docker-compose`:
```yaml
EMBER_ENVIRONMENT_NAME: "development"
```

### To set a maintenance message
You have to put this in your `Docker-compose.override.yml`:
```yaml
EMBER_ANNOUNCE_MAINTENANCE_ENABLED: "false"
EMBER_ANNOUNCE_MAINTENANCE_MESSAGE: "Het Contact- en Organisatiegegevens zal donderdag 29/05 tussen 12:00 en 15.00 u. onbeschikbaar zijn wegens onderhoud"
```

### To set a new deployment message
You have to put this in your `Docker-compose.override.yml`:
```yaml
EMBER_ANNOUNCE_NEW_DEPLOYMENT_ENABLED: "false"
EMBER_ANNOUNCE_NEW_DEPLOYMENT_MESSAGE: "Het Contact- en Organisatiegegevens zal vanaf donderdag 24/03, 19.00 uur t.e.m. vrijdag 25/03 8.00 uur onbeschikbaar zijn wegens de uitrol van een nieuwe versie"
```

### To set an announce testing message
You have to put this in your `Docker-compose.override.yml`:
```yaml
EMBER_ANNOUNCE_TESTING_ENABLED: "true"
EMBER_ANNOUNCE_TESTING_MESSAGE: "Het Contact- en Organisatiegegevens zal vandaag, donderdag 24/03, niet stabiel zijn wegens uitvoering van testen."
```
