# Contact en - Organisatie gegevens

For documentation about the CLBV-Application, you can go to: [GitBook Documentation](https://app.gitbook.com/o/-MP9Yduzf5xu7wIebqPG/s/O4tUAyb57Hcu6xbEK2aU/)





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
```