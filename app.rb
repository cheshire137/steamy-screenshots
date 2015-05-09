require 'open-uri'
require 'json'
require_relative 'steam_user'
require_relative 'steam_api'

get '/' do
  File.read('public/index.html')
end

get '/image' do
  image_url = params[:url]
  begin
    file = open(image_url)
  rescue URI::InvalidURIError => ex
    status 400
    content_type 'text/plain'
    return "URL #{image_url} is not valid."
  end
  content_type file.content_type
  file
end

get '/config.json' do
  content_type 'application/json'
  {rssServiceUrl: ENV['RSS_SERVICE_URL']}.to_json
end

get '/steam_friends.json' do
  content_type 'application/json'
  steam_user_name = params[:user]
  steam_id = SteamApi.get_steam_id(steam_user_name)
  friends = SteamApi.get_friends(steam_id)
  friends.sort {|a, b|
    a.to_s.downcase <=> b.to_s.downcase
  }.map(&:to_hash).to_json
end

get '/steam_apps.json' do
  content_type 'application/json'
  SteamApi.get_steam_apps.to_json
end

STEAM_APPS_INDEX_CACHE_FILE = 'steam-apps-index.json'

def write_steam_apps_index_cache
  unless File.exists?(SteamApi::STEAM_APPS_CACHE_FILE)
    SteamApi.get_steam_apps
  end
  cmd = "node_modules/lunr-index-build/bin/lunr-index-build -r appid -f name " +
        "< #{SteamApi::STEAM_APPS_CACHE_FILE} > #{STEAM_APPS_INDEX_CACHE_FILE}"
end

get '/steam_apps_index.json' do
  content_type 'application/json'
  if File.exists?(STEAM_APPS_INDEX_CACHE_FILE)
    File.read(STEAM_APPS_INDEX_CACHE_FILE)
  else
    {}.to_json
  end
end
