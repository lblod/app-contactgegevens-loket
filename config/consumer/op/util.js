const {
  MAX_REASONING_RETRY_ATTEMPTS,
  SLEEP_TIME_AFTER_FAILED_REASONING_OPERATION,
  MAX_DB_RETRY_ATTEMPTS,
  SLEEP_BETWEEN_BATCHES,
  SLEEP_TIME_AFTER_FAILED_DB_OPERATION,
  TARGET_GRAPH,
  LANDING_ZONE_GRAPH,
  BATCH_SIZE,
} = require('./config');

const prefixes = `
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
`

async function batchedDbUpdate(
  muUpdate,
  graph,
  triples,
  extraHeaders,
  endpoint,
  batchSize,
  maxAttempts,
  sleepBetweenBatches = 1000,
  sleepTimeOnFail = 1000,
  operation = 'INSERT'
) {
  console.log(endpoint)
  for (let i = 0; i < triples.length; i += batchSize) {
    console.log(`Inserting triples in batch: ${i}-${i + batchSize}`);

    const batch = triples.slice(i, i + batchSize).join('\n');

    const insertCall = async () => {
      await muUpdate(`
${operation} DATA {
GRAPH <${graph}> {
${batch}
}
}
`, extraHeaders, endpoint);
    };

    await operationWithRetry(insertCall, 0, maxAttempts, sleepTimeOnFail);

    console.log(`Sleeping before next query execution: ${sleepBetweenBatches}`);
    await new Promise(r => setTimeout(r, sleepBetweenBatches));
  }
}

async function operationWithRetry(callback,
  attempt,
  maxAttempts,
  sleepTimeOnFail) {
  try {
    if (typeof callback === "function")
      return await callback();
    else // Catch error from promise - not how I would do it normally, but allows re use of existing code.
      return await callback;
  }
  catch (e) {
    console.log(`Operation failed for ${callback.toString()}, attempt: ${attempt} of ${maxAttempts}`);
    console.log(`Error: ${e}`);
    console.log(`Sleeping ${sleepTimeOnFail} ms`);

    if (attempt >= maxAttempts) {
      console.log(`Max attempts reached for ${callback.toString()}, giving up`);
      throw e;
    }

    await new Promise(r => setTimeout(r, sleepTimeOnFail));
    return operationWithRetry(callback, ++attempt, maxAttempts, sleepTimeOnFail);
  }
}

/**
 * Splits an array into two parts, a part that passes and a part that fails a predicate function.
 * Credits: https://github.com/benjay10
 * @public
 * @function partition
 * @param {Array} arr - Array to be partitioned
 * @param {Function} fn - Function that accepts single argument: an element of the array, and should return a truthy or falsy value.
 * @returns {Object} Object that contains keys passes and fails, each representing an array with elemets that pass or fail the predicate respectively
 */
function partition(arr, fn) {
  let passes = [], fails = [];
  arr.forEach((item) => (fn(item) ? passes : fails).push(item));
  return { passes, fails };
}

/**
 * Send triples to reasoning service for conversion
 *
 */
async function transformTriples(fetch, triples, mapping) {
  return await operationWithRetry(mainConversion(fetch, triples, mapping), 0,
    MAX_REASONING_RETRY_ATTEMPTS, SLEEP_TIME_AFTER_FAILED_REASONING_OPERATION);
}

async function mainConversion(fetch, triples, mapping) {
  let formdata = new URLSearchParams();
  formdata.append("data", triples);

  let requestOptions = {
    method: 'POST',
    body: formdata,
    redirect: 'follow'
  };

  const response = await fetch(`http://reasoner/reason/dl2op/${mapping}`, requestOptions)
  return await response.text();
}

async function transformStatements(fetch, triples, mapping = 'main') {
  console.log(`Received ${JSON.stringify(triples)} to transform`);
  const transformedTriples = await transformTriples(fetch, triples.join('\n'), mapping);
  statements = transformedTriples ? transformedTriples.replace(/\n{2,}/g, '').split('\n') : [];
  console.log(`CONVERSION: FROM ${triples.length} triples to ${statements.length}`);
  return statements;
}

async function deleteFromTargetGraph(lib, statements) {
  console.log(`Deleting ${statements.length} statements from target graph`);
  console.log(`Statements:  ${JSON.stringify(statements)}`)
  await batchedDbUpdate(
    lib.muAuthSudo.updateSudo,
    TARGET_GRAPH,
    statements,
    {},
    process.env.MU_SPARQL_ENDPOINT,
    BATCH_SIZE,
    MAX_DB_RETRY_ATTEMPTS,
    SLEEP_BETWEEN_BATCHES,
    SLEEP_TIME_AFTER_FAILED_DB_OPERATION,
    'DELETE');
}

async function insertIntoTargetGraph(lib, statements) {
  console.log(`Inserting ${statements.length} statements into target graph`);
  console.log(`Statements:  ${JSON.stringify(statements)}`)

  await batchedDbUpdate(
    lib.muAuthSudo.updateSudo,
    TARGET_GRAPH,
    statements,
    {},
    process.env.MU_SPARQL_ENDPOINT,
    BATCH_SIZE,
    MAX_DB_RETRY_ATTEMPTS,
    SLEEP_BETWEEN_BATCHES,
    SLEEP_TIME_AFTER_FAILED_DB_OPERATION,
    'INSERT');
}

async function insertIntoPublicGraph(lib, statements) {
  console.log(`Inserting ${statements.length} statements into public graph`);
  console.log(`Statements:  ${JSON.stringify(statements)}`)

  await batchedDbUpdate(
    lib.muAuthSudo.updateSudo,
    'http://mu.semte.ch/graphs/public',
    statements,
    {},
    process.env.MU_SPARQL_ENDPOINT,
    BATCH_SIZE,
    MAX_DB_RETRY_ATTEMPTS,
    SLEEP_BETWEEN_BATCHES,
    SLEEP_TIME_AFTER_FAILED_DB_OPERATION,
    'INSERT');
}

async function insertIntoSpecificGraphs(lib, statementsWithGraphs) {

  for( let graph in statementsWithGraphs) {
    console.log(`Inserting ${statementsWithGraphs[graph].length} statements into ${graph} graph`);
    console.log(`Statements:  ${JSON.stringify(statementsWithGraphs[graph])}`)
    await batchedDbUpdate(
      lib.muAuthSudo.updateSudo,
      graph,
      statementsWithGraphs[graph],
      {},
      process.env.MU_SPARQL_ENDPOINT,
      BATCH_SIZE,
      MAX_DB_RETRY_ATTEMPTS,
      SLEEP_BETWEEN_BATCHES,
      SLEEP_TIME_AFTER_FAILED_DB_OPERATION,
      'INSERT');
  }
  
}

async function deleteFromPublicGraph(lib, statements) {
  console.log(`Deleting ${statements.length} statements from public graph`);
  console.log(`Statements:  ${JSON.stringify(statements)}`)

  await batchedDbUpdate(
    lib.muAuthSudo.updateSudo,
    'http://mu.semte.ch/graphs/public',
    statements,
    {},
    process.env.MU_SPARQL_ENDPOINT,
    BATCH_SIZE,
    MAX_DB_RETRY_ATTEMPTS,
    SLEEP_BETWEEN_BATCHES,
    SLEEP_TIME_AFTER_FAILED_DB_OPERATION,
    'DELETE');
}

async function deleteFromSpecificGraphs(lib, statementsWithGraphs) {
  

  for( let graph in statementsWithGraphs) {
    console.log(`Deleting ${statementsWithGraphs[graph].length} statements from ${graph} graph`);
    console.log(`Statements:  ${JSON.stringify(statementsWithGraphs[graph])}`)
    await batchedDbUpdate(
      lib.muAuthSudo.updateSudo,
      graph,
      statementsWithGraphs[graph],
      {},
      process.env.MU_SPARQL_ENDPOINT,
      BATCH_SIZE,
      MAX_DB_RETRY_ATTEMPTS,
      SLEEP_BETWEEN_BATCHES,
      SLEEP_TIME_AFTER_FAILED_DB_OPERATION,
      'INSERT');
  }
  
}

async function transformLandingZoneGraph(fetch, endpoint, mapping = 'main') {
  console.log(`Transforming landing zone graph: ${LANDING_ZONE_GRAPH}`);

  const response = await fetch(`http://reasoner/reason/dl2op/${mapping}?data=${encodeURIComponent(`${endpoint}?default-graph-uri=&query=CONSTRUCT+%7B%0D%0A%3Fs+%3Fp+%3Fo%0D%0A%7D+WHERE+%7B%0D%0A+GRAPH+<${LANDING_ZONE_GRAPH}>+%7B%0D%0A%3Fs+%3Fp+%3Fo%0D%0A%7D%0D%0A%7D&should-sponge=&format=text%2Fplain&timeout=0&run=+Run+Query`)}`);
  const text = await response.text();
  const statements = text.replace(/\n{2,}/g, '').split('\n');

  return statements;
}

async function moveToPublic(muUpdate, endpoint) {
  console.log('moving to public')
  await moveTypeToPublic(muUpdate, endpoint, 'code:BestuurseenheidClassificatieCode')
  await moveTypeToPublic(muUpdate, endpoint, 'org:TypeVestiging')
  await moveTypeToPublic(muUpdate, endpoint, 'besluit:Bestuurseenheid')
  await moveTypeToPublic(muUpdate, endpoint, 'skos:Concept')
  await moveTypeToPublic(muUpdate, endpoint, 'euvoc:Country')
  await moveTypeToPublic(muUpdate, endpoint, 'prov:Location')
}

async function moveTypeToPublic(muUpdate, endpoint, type) {
  await muUpdate(`
    ${prefixes}
    DELETE {
      GRAPH <${LANDING_ZONE_GRAPH}> {
        ?subject a ${type};
          ?pred ?obj.
      }
    }
    INSERT {
      GRAPH <http://mu.semte.ch/graphs/public> {
        ?site a ${type};
          ?pred ?obj.
      }
    }
    WHERE {
      ?site a ${type};
          ?pred ?obj.
    }
  `, undefined, endpoint)
}


async function moveToOrganizationsGraph(muUpdate, endpoint) {
  // Move primary sites
  await muUpdate(`
    ${prefixes}
    DELETE {
      GRAPH <${LANDING_ZONE_GRAPH}> {
        ?site a org:Site;
          ?pred ?obj.
      }
    }
    INSERT {
      GRAPH ?g {
        ?site a org:Site;
          ?pred ?obj.
      }
    }
    WHERE {
      ?adminUnit org:hasPrimarySite ?site.
      ?adminUnit mu:uuid ?adminUnitUuid.
      ?site a org:Site;
          ?pred ?obj.
      BIND(IRI(CONCAT("http://mu.semte.ch/graphs/organizations/", ?adminUnitUuid)) AS ?g)
    }
  `, undefined, endpoint)

  // Move sites
  await muUpdate(`
    ${prefixes}
    DELETE {
      GRAPH <${LANDING_ZONE_GRAPH}> {
        ?site a org:Site;
          ?pred ?obj.
      }
    }
    INSERT {
      GRAPH ?g {
        ?site a org:Site;
          ?pred ?obj.
      }
    }
    WHERE {
      ?adminUnit org:hasSite ?site.
      ?adminUnit mu:uuid ?adminUnitUuid.
      ?site a org:Site;
          ?pred ?obj.
      BIND(IRI(CONCAT("http://mu.semte.ch/graphs/organizations/", ?adminUnitUuid)) AS ?g)
    }
  `, undefined, endpoint)

  // Move contacts
  await muUpdate(`
    ${prefixes}
    DELETE {
      GRAPH <${LANDING_ZONE_GRAPH}> {
        ?contactPoint a schema:ContactPoint;
          ?pred ?obj.
      }
    }
    INSERT {
      GRAPH ?g {
        ?contactPoint a schema:ContactPoint;
          ?pred ?obj.
      }
    }
    WHERE {
      GRAPH ?g {
        ?site org:siteAddress ?contactPoint.
      }
      ?contactPoint a schema:ContactPoint;
        ?pred ?obj.
    }
  `, undefined, endpoint)

  // Move addresses from sites
  await muUpdate(`
    ${prefixes}
    DELETE {
      GRAPH <${LANDING_ZONE_GRAPH}> {
        ?address a locn:Address;
          ?pred ?obj.
      }
    }
    INSERT {
      GRAPH ?g {
        ?address a locn:Address;
          ?pred ?obj.
      }
    }
    WHERE {
      GRAPH ?g {
        ?site organisatie:bestaatUit ?address.
      }
      ?address a locn:Address;
        ?pred ?obj.
    }
  `, undefined, endpoint)

  //Move addresses from contacts
  await muUpdate(`
    ${prefixes}
    DELETE {
      GRAPH <${LANDING_ZONE_GRAPH}> {
        ?address a locn:Address;
          ?pred ?obj.
      }
    }
    INSERT {
      GRAPH ?g {
        ?address a locn:Address;
          ?pred ?obj.
      }
    }
    WHERE {
      GRAPH ?g {
        ?contact locn:address ?address.
      }
      ?address a locn:Address;
        ?pred ?obj.
    }
  `, undefined, endpoint)

  //Move identifiers
  await muUpdate(`
    ${prefixes}
    DELETE {
      GRAPH <${LANDING_ZONE_GRAPH}> {
        ?identifier a adms:Identifier;
        mu:uuid ?uuid;
          skos:notation ?idName;
          generiek:gestructureerdeIdentificator ?structuredId.
        ?structuredId a generiek:GestructureerdeIdentificator;
          mu:uuid ?structuredUuid;
          generiek:lokaleIdentificator ?localId.
      }
    }
    INSERT {
      GRAPH ?g {
        ?identifier a adms:Identifier;
        mu:uuid ?uuid;
          skos:notation ?idName;
          generiek:gestructureerdeIdentificator ?structuredId.
        ?structuredId a generiek:GestructureerdeIdentificator;
          mu:uuid ?structuredUuid;
          generiek:lokaleIdentificator ?localId.
      }
    }
    WHERE {
      ?adminUnit adms:identifier ?identifier.
      ?adminUnit mu:uuid ?adminUnitUuid.
      ?identifier a adms:Identifier;
        mu:uuid ?uuid;
          skos:notation ?idName;
          generiek:gestructureerdeIdentificator ?structuredId.
        ?structuredId a generiek:GestructureerdeIdentificator;
          mu:uuid ?structuredUuid;
          generiek:lokaleIdentificator ?localId.
          
      BIND(IRI(CONCAT("http://mu.semte.ch/graphs/organizations/", ?adminUnitUuid)) AS ?g)
    }
  `, undefined, endpoint)

}

module.exports = {
  batchedDbUpdate,
  partition,
  transformStatements,
  transformLandingZoneGraph,
  deleteFromTargetGraph,
  insertIntoTargetGraph,
  moveToOrganizationsGraph,
  moveToPublic,
  insertIntoPublicGraph,
  deleteFromPublicGraph,
  insertIntoSpecificGraphs,
  deleteFromSpecificGraphs
};