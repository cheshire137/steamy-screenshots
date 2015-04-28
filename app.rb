require 'open-uri'

get '/' do
  redirect '/index.html'
end

get '/image' do
  image_url = params[:url]
  file = open(image_url)
  content_type file.content_type
  file
end
