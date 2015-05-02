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
  friends.map(&:to_hash).to_json
end
