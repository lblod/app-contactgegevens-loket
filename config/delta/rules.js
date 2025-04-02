export default [
    {
      match: {
        // anything
      },
      callback: {
        url: "http://resource/.mu/delta", method: "POST"
      },
      options: {
        resourceFormat: "v0.0.1",
        gracePeriod: 1000,
        ignoreFromSelf: true,
        optOutMuScopeIds: [ "http://redpencil.data.gift/id/concept/muScope/deltas/consumer/initialSync" ]
      }
    },
    {
      match: {
        predicate: {
          type: 'uri',
          value: 'http://www.w3.org/ns/adms#status',
        },
        object: {
          type: 'uri',
          value: 'http://redpencil.data.gift/id/concept/JobStatus/success',
        },
      },
      callback: {
        url: 'http://contact-data-dispatcher/initial-dispatch',
        method: 'POST'
      },
      options: {
        resourceFormat: "v0.0.1",
        gracePeriod: 10000,
        ignoreFromSelf: true
      }
    },
    {
      match: {
        graph: {
          type: 'uri',
          value: 'http://mu.semte.ch/graphs/ingest'
        }
      },
      callback: {
        url: 'http://contact-data-dispatcher/delta',
        method: 'POST'
      },
      options: {
        resourceFormat: "v0.0.1",
        gracePeriod: 10000,
        ignoreFromSelf: true
      }
    }
  /* Commenting out delta producer rules for now as the producers are not up yet.
    {
      match: {
        predicate: {
          type: 'uri',
          value: 'http://www.w3.org/ns/adms#status'
        }
      },
      callback: {
        method: 'POST',
        url: 'http://jobs-controller/delta'
      },
      options: {
        resourceFormat: 'v0.0.1',
        gracePeriod: 1000,
        ignoreFromSelf: true
      }
    },
    {
      match: {
        // anything -> note you can tweak the performance here by filtering on graphs if you need to.
      },
      callback: {
        url: 'http://delta-producer-pub-graph-maintainer/delta',
        method: 'POST'
      },
      options: {
        resourceFormat: 'v0.0.1',
        gracePeriod: 1000,
        ignoreFromSelf: true
      }
    },
    {
      match: {
        predicate: {
          type: 'uri',
          value: 'http://www.w3.org/ns/adms#status'
        },
        object: {
          type: 'uri',
          value: 'http://redpencil.data.gift/id/concept/JobStatus/scheduled'
        }
      },
      callback: {
        url: 'http://delta-producer-dump-file-publisher/delta',
        method: 'POST'
      },
      options: {
        resourceFormat: 'v0.0.1',
        gracePeriod: 1000,
        ignoreFromSelf: true
      }
    }
    */
  ];