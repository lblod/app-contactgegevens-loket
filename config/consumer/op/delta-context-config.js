
const PREFIXES = `
PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX lblodgeneriek: <https://data.lblod.info/vocabularies/generiek/>
  PREFIX org: <http://www.w3.org/ns/org#>
  PREFIX code: <http://lblod.data.gift/vocabularies/organisatie/>
  PREFIX adms: <http://www.w3.org/ns/adms#>
  PREFIX generiek: <https://data.vlaanderen.be/ns/generiek#>
  PREFIX ere: <http://data.lblod.info/vocabularies/erediensten/>
  PREFIX organisatie: <https://data.vlaanderen.be/ns/organisatie#>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX euvoc: <http://publications.europa.eu/ontology/euvoc#>
  PREFIX prov: <http://www.w3.org/ns/prov#>
  PREFIX schema: <http://schema.org/>
  PREFIX locn: <http://www.w3.org/ns/locn#>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>`

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
            ${subject} ext:goesInGraph ?g.
        } WHERE {
            ?adminUnit adms:identifier ${subject};
                mu:uuid ?uuid.
            BIND(IRI(CONCAT("http://mu.semte.ch/graphs/organizations/", ?uuid)) AS ?g)
        }`
    },
    {
      trigger: { // subjectType or predicateValue
        subjectType: "generiek:GestructureerdeIdentificator"
      },
      queryTemplate: (subject) => `
        ${PREFIXES}
        CONSTRUCT {
          ${subject} ext:goesInGraph ?g.
        } WHERE {
          GRAPH ?g {
              ?identifier generiek:gestructureerdeIdentificator ${subject}.
          }
        }`
    },
    {
      trigger: { // subjectType or predicateValue
        subjectType: "org:Site"
      },
      queryTemplate: (subject) => `
        ${PREFIXES}
        CONSTRUCT {
          ${subject} ext:goesInGraph ?graphOne.
          ${subject} ext:goesInGraph ?graphTwo.
        } WHERE {
          OPTIONAL {
            ?adminUnitOne org:hasPrimarySite ${subject};
              mu:uuid ?uuidOne.
            BIND(IRI(CONCAT("http://mu.semte.ch/graphs/organizations/", ?uuidOne)) AS ?graphOne)
          }
          OPTIONAL {
            ?adminUnitTwo org:hasSite ${subject};
                mu:uuid ?uuidTwo.
            BIND(IRI(CONCAT("http://mu.semte.ch/graphs/organizations/", ?uuidTwo)) AS ?graphTwo)
          }
        }`
    },
    {
      trigger: { // subjectType or predicateValue
        subjectType: "schema:ContactPoint"
      },
      queryTemplate: (subject) => `
        ${PREFIXES}
        CONSTRUCT {
            ${subject} ext:goesInGraph ?g.
        } WHERE {
          GRAPH ?g {
            ?site org:siteAddress ${subject}.
          }
        }`
    },
    {
      trigger: { // subjectType or predicateValue
        subjectType: "locn:Address"
      },
      queryTemplate: (subject) => `
        ${PREFIXES}
        CONSTRUCT {
          ${subject} ext:goesInGraph ?graphOne.
          ${subject} ext:goesInGraph ?graphTwo.
        } WHERE {
          OPTIONAL {
            GRAPH ?graphOne {
              ?site organisatie:bestaatUit ${subject}.
            }
          }
          OPTIONAL {
            GRAPH ?graphTwo {
              ?contact locn:address ${subject}.
            }
          }
        }`
    },
    //Predicate triggers to solve out of order deltas
    {
      trigger: { // subjectType or predicateValue
        predicateValue: "org:hasSite"
      },
      queryTemplate: (subject) => `
        ${PREFIXES}
        CONSTRUCT {
          ${subject} ext:contextDataGoesInGraph ?graph.
          ?site ?pSite ?oSite.
          ?contact ?pContact ?oContact.
          ?address ?pAddress ?oAddress.
          ?addressContact ?pAddressContact ?oAddressContact.
        } WHERE {
          ${subject} mu:uuid ?uuid.
          ${subject} org:hasSite ?site.
          ?site ?pSite ?oSite.
          {
            ?site org:siteAddress ?contact.
            ?contact ?pContact ?oContact.
            ?contact locn:address ?addressContact.
            ?addressContact ?pAddressContact ?oAddressContact.
          }
          UNION
          {
            ?site org:siteAddress ?contact.
            ?contact ?pContact ?oContact.
          }
          UNION
          {
            ?site organisatie:bestaatUit ?address.
            ?address ?pAddress ?oAddress.
          }        
          BIND(IRI(CONCAT("http://mu.semte.ch/graphs/organizations/", ?uuid)) AS ?graph)
        }`
    },
    {
      trigger: { // subjectType or predicateValue
        predicateValue: "org:hasPrimarySite"
      },
      queryTemplate: (subject) => `
        ${PREFIXES}
        CONSTRUCT {
          ${subject} ext:contextDataGoesInGraph ?graph.
          ?site ?pSite ?oSite.
          ?contact ?pContact ?oContact.
          ?address ?pAddress ?oAddress.
          ?addressContact ?pAddressContact ?oAddressContact.
        } WHERE {
          ${subject} mu:uuid ?uuid.
          ${subject} org:hasPrimarySite ?site.
          ?site ?pSite ?oSite.
          {
            ?site org:siteAddress ?contact.
            ?contact ?pContact ?oContact.
            ?contact locn:address ?addressContact.
            ?addressContact ?pAddressContact ?oAddressContact.
          }
          UNION
          {
            ?site org:siteAddress ?contact.
            ?contact ?pContact ?oContact.
          }
          UNION
          {
            ?site organisatie:bestaatUit ?address.
            ?address ?pAddress ?oAddress.
          }        
          BIND(IRI(CONCAT("http://mu.semte.ch/graphs/organizations/", ?uuid)) AS ?graph)
        }`
    },
    {
      trigger: { // subjectType or predicateValue
        predicateValue: "org:siteAddress"
      },
      queryTemplate: (subject) => `
        ${PREFIXES}
        CONSTRUCT {
          ?contact ?pContact ?oContact.
          ?addressContact ?pAddressContact ?oAddressContact.
        } WHERE {
          ${subject} org:siteAddress ?contact.
          ?contact ?pContact ?oContact.
          OPTIONAL {
            ?contact locn:address ?addressContact.
            ?addressContact ?pAddressContact ?oAddressContact.
          }
        }`
    },
    {
      trigger: { // subjectType or predicateValue
        predicateValue: "locn:address"
      },
      queryTemplate: (subject) => `
        ${PREFIXES}
        CONSTRUCT {
          ?addressContact ?pAddressContact ?oAddressContact.
        } WHERE {
          ${subject} locn:address ?addressContact.
          ?addressContact ?pAddressContact ?oAddressContact.
        }`
    },
    {
      trigger: { // subjectType or predicateValue
        predicateValue: "organisatie:bestaatUit"
      },
      queryTemplate: (subject) => `
        ${PREFIXES}
        CONSTRUCT {
          ?address ?pAddress ?oAddress.
        } WHERE {
          ${subject} organisatie:bestaatUit ?address.
          ?address ?pAddress ?oAddress.
        }`
    }
  ]
}

module.exports = {
  contextConfig,
  PREFIXES
};