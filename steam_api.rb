require 'open-uri'
require 'json'
require 'uri'

class SteamApi
  API_URL = 'http://api.steampowered.com'.freeze

  # See https://wiki.teamfortress.com/wiki/WebAPI/ResolveVanityURL
  def self.get_steam_id user_name
    user_name = URI.encode_www_form_component(user_name)
    url = "#{API_URL}/ISteamUser/ResolveVanityURL/v0001/" +
          "?key=#{ENV['STEAM_API_KEY']}&vanityurl=#{user_name}"
    json = JSON.parse(open(url).read)
    json['response']['steamid']
  end

  # See https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29
  def self.get_details all_steam_ids
    results = []
    batched_steam_ids = all_steam_ids.each_slice(100).to_a
    batched_steam_ids.each do |steam_ids|
      steam_ids_list = steam_ids.join(',')
      url = "#{API_URL}/ISteamUser/GetPlayerSummaries/v0002/" +
            "?key=#{ENV['STEAM_API_KEY']}&steamids=#{steam_ids_list}"
      json = JSON.parse(open(url).read)
      json['response']['players'].each do |player|
        results << SteamUser.new(player)
      end
    end
    results
  end

  # See https://developer.valvesoftware.com/wiki/Steam_Web_API#GetFriendList_.28v0001.29
  def self.get_friends steam_id
    url = "#{API_URL}/ISteamUser/GetFriendList/v0001/" +
          "?key=#{ENV['STEAM_API_KEY']}&steamid=#{steam_id}&relationship=friend"
    begin
      json = JSON.parse(open(url).read)
    rescue OpenURI::HTTPError
      return []
    end
    friend_steam_ids = json['friendslist']['friends'].map {|data|
      data['steamid']
    }
    get_details friend_steam_ids
  end
end
