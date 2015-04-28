# Steamy iTunes Colors

Uses a port of [Panic's iTunes album art color algorithm](http://www.panic.com/blog/2012/12/itunes-11-and-colors/) in JavaScript to get colors from a given Steam screenshot.

## How to Run

    cp config.json.sample public/config.json

Edit public/config.json to specify the URL to where your
[Steam screenshots RSS feed app](https://github.com/moneypenny/steam-screenshots-rss)
is hosted.

    bundle
    rackup

Visit [localhost:9292](http://localhost:9292).
