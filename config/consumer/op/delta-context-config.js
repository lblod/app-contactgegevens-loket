
const PREFIXES = `
PREFIX org: <http://www.w3.org/ns/org#>
PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
PREFIX lblodlg: <http://data.lblod.info/vocabularies/leidinggevenden/>
PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>`

const contextConfig = {
  addTypes: {
    scope: 'all', // 'inserts, 'deletes', 'all' or none. To add rdf:type to subjects of inserts, deletes or both
    exhausitive: false, // true or false: find all types for a subject, even if one is already present in delta
  },
  contextQueries: [
    {
      trigger: { // subjectType or predicateValue
        subjectType: "adms:identifier"
      },
      queryTemplate: (subject) => `
        ${PREFIXES}
        CONSTRUCT {
            ?adminUnit mu:uuid ?uuid.
        } WHERE {
            ?adminUnit adms:identifier ${subject};
                mu:uuid ?uuid.
        }`
    },
  ]
}

module.exports = {
  contextConfig,
  PREFIXES
};