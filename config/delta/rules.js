export default [
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
        url: 'http://delta-producer-pub-graph-maintainer/contactdata/delta',
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
    // Other delta listeners
  ];