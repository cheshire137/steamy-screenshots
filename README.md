# Steamy iTunes Colors

Uses a port of [Panic's iTunes album art color algorithm](http://www.panic.com/blog/2012/12/itunes-11-and-colors/) in JavaScript to get colors from a given Steam screenshot.

![Screenshot](https://raw.githubusercontent.com/moneypenny/steamy-screenshots/master/screenshot.png)

## How to Run

    cp env.sh.sample env.sh

Edit env.sh to specify the URL to where your
[Steam screenshots RSS feed app](https://github.com/moneypenny/steam-screenshots-rss)
is hosted, as well as your [Steam web API key](http://steamcommunity.com/dev).

    bundle
    rackup

Visit [localhost:9292](http://localhost:9292).

## How to Deploy to Heroku

After pushing to Heroku, you need to set some environment variables:

    heroku config:set RSS_SERVICE_URL=http://url-to-steam-screenshot-rss.com
    heroku config:set STEAM_API_KEY=your_steam_web_api_key

## Thanks

Thanks to [lukasklein](https://github.com/lukasklein/itunes-colors) for the
JavaScript to extract colors from the screenshots. Thanks to
[TinyColor](https://github.com/bgrins/TinyColor) for color parsing.
