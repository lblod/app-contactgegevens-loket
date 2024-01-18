defmodule Dispatcher do
  use Matcher
  define_accept_types [
    html: ["text/html", "application/xhtml+html"],
    json: ["application/json", "application/vnd.api+json"],
    upload: ["multipart/form-data"],
    sparql_json: ["application/sparql-results+json"],
    any: [ "*/*" ],
  ]

  define_layers [ :api_services, :api, :frontend, :not_found ]

  @any %{}
  @json %{ accept: %{ json: true } }
  @html %{ accept: %{ html: true } }

  # In order to forward the 'themes' resource to the
  # resource service, use the following forward rule:
  #
  # match "/themes/*path", @json do
  #   Proxy.forward conn, path, "http://resource/themes/"
  # end
  #
  # Run `docker-compose restart dispatcher` after updating
  # this file.

  match "/administrative-units/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://resource/administrative-units/"
  end

  match "/administrative-unit-classification-codes/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/administrative-unit-classification-codes/"
  end

  match "/organization-status-codes/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/organization-status-codes/"
  end

  match "/adresses-register/*path" do
    forward conn, path, "http://adressenregister"
  end

  match "/organizations/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/organizations/"
  end

  match "/identifiers/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/identifiers/"
  end

  match "/structured-identifiers/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/structured-identifiers/"
  end

  match "/addresses/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/addresses/"
  end

  match "/sites/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/sites/"
  end

  match "/contact-points/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/contact-points/"
  end

  match "/concepts/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/concepts/"
  end

  match "/site-types/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/site-types/"
  end

  match "/nationalities/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/nationalities/"
  end

  match "/locations/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/locations/"
  end

  match "/users/*path" do
    forward conn, path, "http://cache/users/"
  end
  match "/accounts/*path" do
    forward conn, path, "http://cache/accounts/"
  end

  match "/change-events/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/change-events/"
  end

  match "/change-event-types/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/change-event-types/"
  end

  match "/change-event-results/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/change-event-results/"
  end

  match "/mock/sessions/*path", %{ accept: [:any], layer: :api} do
    Proxy.forward conn, path, "http://mocklogin/sessions/"
  end

  #################################################################
  # DELTA-PRODUCER
  #################################################################

  match "/datasets/*path", %{ accept: %{ json: true }, layer: :api} do
    forward conn, path, "http://cache/datasets/"
  end

  match "/distributions/*path", %{ accept: %{ json: true }, layer: :api} do
    forward conn, path, "http://cache/distributions/"
  end

  get "/sync/contactdata/files/*path", %{ accept: %{ json: true }, layer: :api} do
    forward conn, path, "http://delta-producer-pub-graph-maintainer/contactdata/files/"
  end

  #################################################################
  # FILES
  # Note: also needed for deltas sharing
  #################################################################
  get "/files/:id/download", _  do
    forward conn, [], "http://file/files/" <> id <> "/download"
  end
  get "/files/*path", %{ accept: %{ json: true }, layer: :api} do
    forward conn, path, "http://resource/files/"
  end

  #################################################################
  # Address search
  #################################################################

  match "/adresses-register/*path" do
    forward conn, path, "http://adressenregister"
  end

  ###############################################################
  # frontend layer
  ###############################################################

  match "/assets/*path", %{ layer: :api } do
    Proxy.forward conn, path, "http://frontend/assets/"
  end

  match "/@appuniversum/*path", %{ layer: :api } do
    Proxy.forward conn, path, "http://frontend/@appuniversum/"
  end

  match "/*path", %{ accept: [:html], layer: :api } do
    Proxy.forward conn, [], "http://frontend/index.html"
  end

  match "/*_path", %{ layer: :frontend } do
    Proxy.forward conn, [], "http://frontend/index.html"
  end


 match "/*_path", %{ accept: [:any], layer: :not_found} do
    send_resp( conn, 404, "{\"error\": {\"code\": 404}")
  end
end
