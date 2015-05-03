require 'open-uri'
require 'json'
require_relative 'steam_user'
require_relative 'steam_api'

get '/' do
  File.read('public/index.html')
end

get '/image' do
  image_url = params[:url]
  file = open(image_url)
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
  cmd = "node_modules/.bin/lunr-generator -r id -f name < " +
        "#{SteamApi::STEAM_APPS_CACHE_FILE} > #{STEAM_APPS_INDEX_CACHE_FILE}"
end

get '/steam_apps_index.json' do
  content_type 'application/json'
  if File.exists?(STEAM_APPS_INDEX_CACHE_FILE)
    cur_time = Time.now
    last_modified = File.mtime(STEAM_APPS_INDEX_CACHE_FILE)
    seconds = (cur_time - last_modified).to_int
    minutes = seconds / 60
    hours = minutes / 60
    days = hours / 60
    write_steam_apps_index_cache if days > 1
  else
    write_steam_apps_index_cache
  end
  File.read(STEAM_APPS_INDEX_CACHE_FILE)
end
