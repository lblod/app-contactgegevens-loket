alias Acl.Accessibility.Always, as: AlwaysAccessible
alias Acl.Accessibility.ByQuery, as: AccessByQuery
alias Acl.GraphSpec.Constraint.ResourceFormat, as: ResourceFormatConstraint
alias Acl.GraphSpec.Constraint.Resource, as: ResourceConstraint
alias Acl.GraphSpec, as: GraphSpec
alias Acl.GroupSpec, as: GroupSpec
alias Acl.GroupSpec.GraphCleanup, as: GraphCleanup
alias Acl.GraphSpec.Constraint.Resource.NoPredicates, as: NoPredicates
alias Acl.GraphSpec.Constraint.Resource.AllPredicates, as: AllPredicates

defmodule Acl.UserGroups.Config do
  defp can_access_dashboard() do
    %AccessByQuery{
      vars: [],
      query: "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
        SELECT DISTINCT ?account WHERE {
          <SESSION_ID> <http://mu.semte.ch/vocabularies/session/account> ?account.
          ?account <http://mu.semte.ch/vocabularies/ext/sessionRole> ?session_role.
          FILTER( ?session_role = \"contactgegevens-dashboard-user\" )
        }"
      }
  end

  def user_groups do
    # These elements are walked from top to bottom.  Each of them may
    # alter the quads to which the current query applies.  Quads are
    # represented in three sections: current_source_quads,
    # removed_source_quads, new_quads.  The quads may be calculated in
    # many ways.  The useage of a GroupSpec and GraphCleanup are
    # common.
    [
      # // PUBLIC
      %GroupSpec{
        name: "public",
        useage: [:read,:read_for_write, :write],
        access: %AlwaysAccessible{}, # TODO: Should be only for logged in users
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/public",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://xmlns.com/foaf/0.1/OnlineAccount",
                        "http://xmlns.com/foaf/0.1/Person",
                        "http://data.vlaanderen.be/ns/besluit#Bestuurseenheid",
                        "http://www.w3.org/ns/org#Organization",
                        "http://lblod.data.gift/vocabularies/organisatie/TypeVestiging",
                        "http://lblod.data.gift/vocabularies/organisatie/BestuurseenheidClassificatieCode",
                        "http://lblod.data.gift/vocabularies/organisatie/OrganisatieStatusCode",
                        "http://www.w3.org/2004/02/skos/core#Concept",
                        "http://www.w3.org/2004/02/skos/core#ConceptScheme",
                        "http://publications.europa.eu/ontology/euvoc#Country",
                        "http://www.w3.org/ns/prov#Location",
                        "http://www.w3.org/ns/org#ChangeEvent",
                        "http://lblod.data.gift/vocabularies/organisatie/VeranderingsgebeurtenisResultaat",
                        "http://lblod.data.gift/vocabularies/organisatie/Veranderingsgebeurtenis",
                        "http://data.lblod.info/vocabularies/erediensten/BestuurVanDeEredienst",
                        "http://data.lblod.info/vocabularies/erediensten/CentraalBestuurVanDeEredienst",
                        "http://lblod.data.gift/vocabularies/organisatie/TypeEredienst",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject"
                      ]
                    } },
                  %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/sessions",
                    constraint: %ResourceFormatConstraint{
                      resource_prefix: "http://mu.semte.ch/sessions/",
                    } } ] },
      # // ORGANIZATION DATA
      %GroupSpec{
        name: "org",
        useage: [:read, :write, :read_for_write],
        access: %AccessByQuery{
          vars: ["session_group"],
          query: "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
                  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
                  SELECT DISTINCT ?session_group WHERE {
                    <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                                 ext:sessionRole \"LoketLB-ContactOrganisatiegegevensGebruiker\".
                    }" },
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://www.w3.org/ns/org#Site",
                        "http://www.w3.org/ns/adms#Identifier",
                        "https://data.vlaanderen.be/ns/generiek#GestructureerdeIdentificator",
                        "http://schema.org/ContactPoint",
                        "http://www.w3.org/ns/locn#Address",
                      ] } } ] },
      # // Dashboard users
      %GroupSpec{
        name: "dashboard-users",
        useage: [:read, :write, :read_for_write],
        access: can_access_dashboard(),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/reports",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://lblod.data.gift/vocabularies/reporting/Report",
                        "http://open-services.net/ns/core#Error",
                          "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#DataContainer",
                          "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                          "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#DataContainer"
                      ]
                    } },

                  %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/system/jobs",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://vocab.deri.ie/cogs#Job",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#DataContainer",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#DataContainer",
                      ]
                    } },
                  %GraphSpec{
                    graph: "http://mu.semte.ch/application",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://persistence.uni-leipzig.org/nlp2rdf/ontologies/rlog#Entry",
                        "http://persistence.uni-leipzig.org/nlp2rdf/ontologies/rlog#Level",
                        "http://persistence.uni-leipzig.org/nlp2rdf/ontologies/rlog#StatusCode",
                        "http://mu.semte.ch/vocabularies/ext/LogSource",
                        "http://lblod.data.gift/vocabularies/reporting/Report"
                      ]
                    } },
                   ] },
      %GraphCleanup{
        originating_graph: "http://mu.semte.ch/application",
        useage: [:write],
        name: "clean"
      }
    ]
  end
end
