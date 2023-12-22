export default [
    {
      match: {
        // anything -> note you can tweak the performance here by filtering on graphs if you need to.
      },
      callback: {
        url: 'http://delta-producer-pub-graph-maintainer-contactdata/contactdata/delta',
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
