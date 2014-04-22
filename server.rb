require 'sinatra'
require 'json'

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end
