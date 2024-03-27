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

  match "/log-entries/*path" do
    Proxy.forward conn, path, "http://resource/log-entries/"
  end

  match "/log-levels/*path" do
    Proxy.forward conn, path, "http://resource/log-levels/"
  end

  match "/status-codes/*path" do
    Proxy.forward conn, path, "http://resource/status-codes/"
  end

  match "/log-sources/*path" do
    Proxy.forward conn, path, "http://resource/log-sources/"
  end

  match "/status-codes/*path" do
    Proxy.forward conn, path, "http://resource/acm-idm-service-log-entries/"
  end

  match "/jobs/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://resource/jobs/"
  end

  match "/tasks/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://resource/tasks/"
  end

  match "/data-containers/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://resource/data-containers/"
  end

  match "/job-errors/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://resource/job-errors/"
  end

  match "/reports/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://resource/reports/"
  end

  match "/administrative-units/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://resource/administrative-units/"
  end

  match "/administrative-unit-classification-codes/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/administrative-unit-classification-codes/"
  end

  match "/organization-status-codes/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/organization-status-codes/"
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
    Proxy.forward conn, path, "http://cache/users/"
  end
  match "/accounts", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, [], "http://resource/accounts/"
  end

  match "/groups/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://resource/administrative-units/"
  end

  match "/accounts/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://accountdetail/accounts/"
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

  match "/worship-services/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://resource/worship-services/"
  end

  match "/recognized-worship-types/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://cache/recognized-worship-types/"
  end

  match "/central-worship-services/*path", %{ accept: [:json], layer: :api} do
    Proxy.forward conn, path, "http://resource/central-worship-services/"
  end



  #################################################################
  # Address search
  #################################################################

  match "/address-search-add-on/*path" do
    Proxy.forward conn, path, "http://address-search-add-on/"
  end

    ###############################################################
  # files
  ###############################################################
  get "/files/:id/download", %{ layer: :api_services } do
    Proxy.forward conn, [], "http://file/files/" <> id <> "/download"
  end

  post "/files/*path", %{ layer: :api_services } do
    Proxy.forward conn, path, "http://file/files/"
  end

  delete "/files/*path", %{ accept: [ :json ], layer: :api_services } do
    Proxy.forward conn, path, "http://file/files/"
  end

  get "/files/*path", %{ accept: [ :json ], layer: :api_services } do
    Proxy.forward conn, path, "http://resource/files/"
  end

  ###############################################################
  # frontend layer
  ###############################################################

  get "/assets/*path",  %{ reverse_host: ["dashboard" | _rest], layer: :frontend }  do
    Proxy.forward conn, path, "http://dashboard/assets/"
  end

  get "/@appuniversum/*path", %{ reverse_host: ["dashboard" | _rest], layer: :frontend} do
    Proxy.forward conn, path, "http://dashboard/@appuniversum/"
  end

  match "/*path", %{ reverse_host: ["dashboard" | _rest], accept: [:html], layer: :frontend } do
    Proxy.forward conn, path, "http://dashboard/index.html"
  end

  match "/*_path", %{ reverse_host: ["dashboard" | _rest], layer: :frontend } do
    Proxy.forward conn, [], "http://dashboard/index.html"
  end

  match "/assets/*path", %{ layer: :frontend } do
    Proxy.forward conn, path, "http://controle-frontend/assets/"
  end

  match "/@appuniversum/*path", %{ layer: :frontend } do
    Proxy.forward conn, path, "http://controle-frontend/@appuniversum/"
  end

  match "/*path", %{ accept: [:html], layer: :frontend } do
    Proxy.forward conn, [], "http://controle-frontend/index.html"
  end

  match "/*_path", %{ layer: :frontend } do
    Proxy.forward conn, [], "http://controle-frontend/index.html"
  end

  ###############################################################
    # Login
  ###############################################################

  match "/sessions/*path", %{ reverse_host: ["dashboard" | _rest] } do
    Proxy.forward conn, path, "http://dashboard-login/sessions/"
  end

  match "/mock/sessions/*path", %{ accept: [:any], layer: :api} do
    Proxy.forward conn, path, "http://controle-login-proxied/sessions/"
  end

  match "/sessions/*path", %{ accept: [:any], layer: :api} do
    Proxy.forward conn, path, "http://controle-login/sessions/"
  end

  match "/*_path", %{ accept: [:any], layer: :not_found} do
    send_resp( conn, 404, "{\"error\": {\"code\": 404}}")
  end

  #################################################################
  #  DELTA: contact-data
  #################################################################

  get "/sync/contact-data/files/*path", %{ accept: [:any], layer: :api} do
    Proxy.forward conn, path, "http://delta-producer-pub-graph-maintainer/files/"
  end

  get "/datasets/*path", %{ layer: :api_services, accept: %{ json: true } } do
    Proxy.forward conn, path, "http://resource/datasets/"
  end
end
