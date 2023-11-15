const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 100;
const MU_CALL_SCOPE_ID_INITIAL_SYNC = process.env.MU_CALL_SCOPE_ID_INITIAL_SYNC || 'http://redpencil.data.gift/id/concept/muScope/deltas/consumer/initialSync';
const BYPASS_MU_AUTH_FOR_EXPENSIVE_QUERIES = process.env.BYPASS_MU_AUTH_FOR_EXPENSIVE_QUERIES == 'true' ? true : false;
const DIRECT_DATABASE_ENDPOINT = process.env.DIRECT_DATABASE_ENDPOINT || 'http://triplestore:8890/sparql';
const MAX_DB_RETRY_ATTEMPTS = parseInt(process.env.MAX_DB_RETRY_ATTEMPTS || 5);
const MAX_REASONING_RETRY_ATTEMPTS = parseInt(process.env.MAX_REASONING_RETRY_ATTEMPTS || 5);
const SLEEP_BETWEEN_BATCHES = parseInt(process.env.SLEEP_BETWEEN_BATCHES || 1000);
const SLEEP_TIME_AFTER_FAILED_REASONING_OPERATION = parseInt(process.env.SLEEP_TIME_AFTER_FAILED_REASONING_OPERATION || 10000);
const SLEEP_TIME_AFTER_FAILED_DB_OPERATION = parseInt(process.env.SLEEP_TIME_AFTER_FAILED_DB_OPERATION || 60000);

// Graphs
const TARGET_GRAPH = process.env.TARGET_GRAPH || `http://mu.semte.ch/graphs/organizations`;
const LANDING_ZONE_GRAPH = process.env.DCR_LANDING_ZONE_GRAPH || `http://mu.semte.ch/graphs/landing-zone/op`;

// ENDPOINTS
const LANDING_ZONE_DATABASE = process.env.DCR_LANDING_ZONE_DATABASE || 'db';
const LANDING_ZONE_DATABASE_ENDPOINT = process.env.DCR_LANDING_ZONE_DATABASE_ENDPOINT || `http://${LANDING_ZONE_DATABASE}:8890/sparql`;

module.exports = {
  BATCH_SIZE,
  MU_CALL_SCOPE_ID_INITIAL_SYNC,
  BYPASS_MU_AUTH_FOR_EXPENSIVE_QUERIES,
  DIRECT_DATABASE_ENDPOINT,
  MAX_DB_RETRY_ATTEMPTS,
  MAX_REASONING_RETRY_ATTEMPTS,
  SLEEP_BETWEEN_BATCHES,
  SLEEP_TIME_AFTER_FAILED_DB_OPERATION,
  SLEEP_TIME_AFTER_FAILED_REASONING_OPERATION,
  LANDING_ZONE_GRAPH,
  TARGET_GRAPH,
  LANDING_ZONE_DATABASE_ENDPOINT
};