# Steamy iTunes Colors

**_Note:_ this project is deprecated in favor of [steam-palettes](https://steam-palettes.herokuapp.com/).**

Uses a port of [Panic's iTunes album art color algorithm](http://www.panic.com/blog/2012/12/itunes-11-and-colors/) in JavaScript to get colors from a given Steam screenshot.

![Screenshot](https://raw.githubusercontent.com/cheshire137/steamy-screenshots/master/screenshot.png)

## How to Run

    cp env.sh.sample env.sh

Edit env.sh to specify the URL to where your
[Steam screenshots RSS feed app](https://github.com/cheshire137/steam-screenshots-rss)
is hosted, as well as your [Steam web API key](http://steamcommunity.com/dev).

    npm install
    bundle
    rackup

Visit [localhost:9292](http://localhost:9292).

## How to Update the List of Steam Apps

    npm install
    npm run-script update-steam-apps
    npm run-script update-steam-apps-index

## How to Deploy to Heroku

After pushing to Heroku with `git push heroku master`, you need to set some environment variables:

    heroku config:set RSS_SERVICE_URL=http://url-to-steam-screenshot-rss.com
    heroku config:set STEAM_API_KEY=your_steam_web_api_key
    heroku buildpacks:add https://github.com/heroku/heroku-buildpack-ruby.git
    heroku buildpacks:add https://github.com/heroku/heroku-buildpack-nodejs.git
    heroku ps:scale web=1

## Thanks

Thanks to [lukasklein](https://github.com/lukasklein/itunes-colors) for the
JavaScript to extract colors from the screenshots. Thanks to
[TinyColor](https://github.com/bgrins/TinyColor) for color parsing. Thanks to
[lunr.js](http://lunrjs.com/) for the Steam app search. Thanks to
[lunr-index-build](https://www.npmjs.com/package/lunr-index-build) for the tool
used to build the lunr.js search index from the list of Steam apps.
