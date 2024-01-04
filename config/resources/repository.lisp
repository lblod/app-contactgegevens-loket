(in-package :mu-cl-resources)

;;;;
;; NOTE
;; docker-compose stop; docker-compose rm; docker-compose up
;; after altering this file.


;;;;
;; Describe the prefixes which you'll use in the domain file here.
;; This is a short-form which allows you to write, for example,
;; (s-url "http://purl.org/dc/terms/title")
;; as (s-prefix "dct:title")

;; (add-prefix "dct" "http://purl.org/dc/terms/")


;;;;;
;; The following is the commented out version of those used in the
;; commented out domain.lisp.

;; (add-prefix "dcat" "http://www.w3.org/ns/dcat#")
;; (add-prefix "dct" "http://purl.org/dc/terms/")
;; (add-prefix "skos" "http://www.w3.org/2004/02/skos/core#")


;;;;;
;; You can use the ext: prefix when you're still searching for
;; the right predicates during development.  This should *not* be
;; used to publish any data under.  It's merely a prefix of which
;; the mu.semte.ch organisation indicates that it will not be used
;; by them and that it shouldn't be used for permanent URIs.

(add-prefix "ext" "http://mu.semte.ch/vocabularies/ext/")

(add-prefix "besluit" "http://data.vlaanderen.be/ns/besluit#")
(add-prefix "skos" "http://www.w3.org/2004/02/skos/core#")
(add-prefix "foaf" "http://xmlns.com/foaf/0.1/")
(add-prefix "cogs" "http://vocab.deri.ie/cogs#")
(add-prefix "dct" "http://purl.org/dc/terms/")
(add-prefix "adms" "http://www.w3.org/ns/adms#")
(add-prefix "task" "http://redpencil.data.gift/vocabularies/tasks/")
(add-prefix "oslc" "http://open-services.net/ns/core#")
(add-prefix "nfo" "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#")
(add-prefix "dbpedia" "http://dbpedia.org/ontology/")
(add-prefix "nie" "http://www.semanticdesktop.org/ontologies/2007/01/19/nie#")
