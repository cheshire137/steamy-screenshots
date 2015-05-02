require 'rubygems'
require 'bundler'

Bundler.require

Dotenv.load('env.sh')

require File.join(File.dirname(__FILE__), 'app.rb')
run Sinatra::Application
