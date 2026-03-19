;;;;;;;;;;;;;;;;;;;
;;; delta messenger
(in-package :delta-messenger)

(add-delta-logger)
(add-delta-messenger "http://deltanotifier/")

;;;;;;;;;;;;;;;;;
;;; configuration
(in-package :client)
(setf *log-sparql-query-roundtrip* t)
(setf *backend* "http://virtuoso:8890/sparql")

(in-package :server)
(setf *log-incoming-requests-p* nil)

;;;;;;;;;;;;;;;;;
;;; access rights
(in-package :acl)

(defparameter *access-specifications* nil)
(defparameter *graphs* nil)
(defparameter *rights* nil)

;; Prefixes used in the constraints below (not in the SPARQL queries)
(define-prefixes
  :besluit "http://data.vlaanderen.be/ns/besluit#"
  :foaf "http://xmlns.com/foaf/0.1/"
  :nfo "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#"
  :org "http://www.w3.org/ns/org#"
  :prov "http://www.w3.org/ns/prov#"
  :skos "http://www.w3.org/2004/02/skos/core#"
  :organisatie "http://lblod.data.gift/vocabularies/organisatie/"
  :erediensten "http://data.lblod.info/vocabularies/erediensten/"
  :euvoc "http://publications.europa.eu/ontology/euvoc#"
  :adms "http://www.w3.org/ns/adms#"
  :generiek "https://data.vlaanderen.be/ns/generiek#"
  :schema "http://schema.org/"
  :locn "http://www.w3.org/ns/locn#"
  :reporting "http://lblod.data.gift/vocabularies/reporting/"
  :core "http://open-services.net/ns/core#"
  :cogs "http://vocab.deri.ie/cogs#"
  :rlog "http://persistence.uni-leipzig.org/nlp2rdf/ontologies/rlog#"
  :ext "http://mu.semte.ch/vocabularies/ext/")

(type-cache::add-type-for-prefix "http://mu.semte.ch/sessions/" "http://mu.semte.ch/vocabularies/session/Session")

(define-graph public ("http://mu.semte.ch/graphs/public")
  ("foaf:Person" -> _)
  ("foaf:OnlineAccount" -> _)
  ("besluit:Bestuurseenheid" -> _)
  ("org:Organization" -> _)
  ("organisatie:TypeVestiging" -> _)
  ("organisatie:BestuurseenheidClassificatieCode" -> _)
  ("organisatie:OrganisatieStatusCode" -> _)
  ("skos:Concept" -> _)
  ("skos:ConceptScheme" -> _)
  ("euvoc:Country" -> _)
  ("prov:Location" -> _)
  ("org:ChangeEvent" -> _)
  ("organisatie:VeranderingsgebeurtenisResultaat" -> _)
  ("organisatie:Veranderingsgebeurtenis" -> _)
  ("erediensten:BestuurVanDeEredienst" -> _)
  ("erediensten:CentraalBestuurVanDeEredienst" -> _)
  ("organisatie:TypeEredienst" -> _)
  ("nfo:FileDataObject" -> _))

(define-graph sessions ("http://mu.semte.ch/graphs/sessions")
  ("http://mu.semte.ch/vocabularies/session/Session" -> _))

(define-graph org ("http://mu.semte.ch/graphs/organizations/")
  ("org:Site" -> _)
  ("adms:Identifier" -> _)
  ("generiek:GestructureerdeIdentificator" -> _)
  ("schema:ContactPoint" -> _)
  ("locn:Address" -> _))

(define-graph reports ("http://mu.semte.ch/graphs/reports")
  ("reporting:Report" -> _)
  ("core:Error" -> _)
  ("nfo:DataContainer" -> _)
  ("nfo:FileDataObject" -> _))

(define-graph jobs ("http://mu.semte.ch/graphs/system/jobs")
  ("cogs:Job" -> _)
  ("nfo:DataContainer" -> _)
  ("nfo:FileDataObject" -> _))

(define-graph application ("http://mu.semte.ch/application")
  ("rlog:Entry" -> _)
  ("rlog:Level" -> _)
  ("rlog:StatusCode" -> _)
  ("ext:LogSource" -> _)
  ("reporting:Report" -> _))

(supply-allowed-group "public")

(supply-allowed-group "dashboard-users"
  :parameters ()
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          SELECT DISTINCT ?account WHERE {
            <SESSION_ID> <http://mu.semte.ch/vocabularies/session/account> ?account.
            ?account <http://mu.semte.ch/vocabularies/ext/sessionRole> ?session_role.
            FILTER( ?session_role = \"contactgegevens-dashboard-user\" )
          }")

(supply-allowed-group "organization-data-user"
  :parameters ("session_group")
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          SELECT DISTINCT ?session_group WHERE {
            <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                          ext:sessionRole \"LoketLB-ContactOrganisatiegegevensGebruiker\".
            }")

(grant (read write)
  :to-graph (public)
  :for-allowed-group "public")

(grant (read write)
  :to-graph (sessions)
  :for-allowed-group "public")

(grant (read write)
  :to-graph (org)
  :for-allowed-group "organization-data-user")

(grant (read write)
  :to-graph (reports)
  :for-allowed-group "dashboard-users")

(grant (read write)
  :to-graph (jobs)
  :for-allowed-group "dashboard-users")

(grant (read write)
  :to-graph (application)
  :for-allowed-group "dashboard-users")