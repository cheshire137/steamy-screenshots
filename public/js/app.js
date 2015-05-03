var SteamyConfig = {};
var RSS = {};
var Colors = {};
var SteamAppIndex = {};
var SteamAppData = {};
var SteamAppScreenshots = [];
var ImageAnalyzer = function(image, callback) {
  var bgcolor, detailColor, findEdgeColor, findTextColors, init, isBlackOrWhite, isContrastingColor, isDarkColor, isDistinct, primaryColor, secondaryColor;
  bgcolor = primaryColor = secondaryColor = detailColor = null;
  init = function(image, callback) {
    var img;
    img = new Image();
    img.src = image;
    return img.onload = function() {
      var ctx, cvs;
      cvs = document.createElement('canvas');
      cvs.width = img.width;
      cvs.height = img.height;
      ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      bgcolor = findEdgeColor(cvs, ctx);
      return findTextColors(cvs, ctx, function() {
        return callback(bgcolor, primaryColor, secondaryColor, detailColor);
      });
    };
  };
  init(image, callback);
  findEdgeColor = function(cvs, ctx) {
    var blue, color, colorCount, count, green, index, leftEdgeColors, nextProposedEdgeColor, pixel, proposedEdgeColor, red, sortedColorCount, _i, _j, _len, _ref;
    leftEdgeColors = ctx.getImageData(0, 0, 1, cvs.height);
    colorCount = {};
    for (pixel = _i = 0, _ref = cvs.height; 0 <= _ref ? _i < _ref : _i > _ref; pixel = 0 <= _ref ? ++_i : --_i) {
      red = leftEdgeColors.data[pixel * 4];
      green = leftEdgeColors.data[pixel * 4 + 1];
      blue = leftEdgeColors.data[pixel * 4 + 2];
      index = red + ',' + green + ',' + blue;
      if (!colorCount[index]) {
        colorCount[index] = 0;
      }
      colorCount[index]++;
    }
    sortedColorCount = [];
    for (color in colorCount) {
      count = colorCount[color];
      if (count > 2) {
        sortedColorCount.push([color, count]);
      }
    }
    sortedColorCount.sort(function(a, b) {
      return b[1] - a[1];
    });
    proposedEdgeColor = sortedColorCount[0];
    if (isBlackOrWhite(proposedEdgeColor[0])) {
      for (_j = 0, _len = sortedColorCount.length; _j < _len; _j++) {
        nextProposedEdgeColor = sortedColorCount[_j];
        if (nextProposedEdgeColor[1] / proposedEdgeColor[1] > 0.3) {
          if (!isBlackOrWhite(nextProposedEdgeColor[0])) {
            proposedEdgeColor = nextProposedEdgeColor;
            break;
          }
        }
      }
    }
    return proposedEdgeColor[0];
  };
  findTextColors = function(cvs, ctx, cb) {
    var blue, color, colorCount, colors, column, count, curDark, defaultColor, findDarkTextColor, green, index, possibleColorsSorted, red, row, _i, _j, _k, _len, _ref, _ref1;
    colors = ctx.getImageData(0, 0, cvs.width, cvs.height);
    findDarkTextColor = !isDarkColor(bgcolor);
    colorCount = {};
    for (row = _i = 0, _ref = cvs.height; 0 <= _ref ? _i < _ref : _i > _ref; row = 0 <= _ref ? ++_i : --_i) {
      for (column = _j = 0, _ref1 = cvs.width; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; column = 0 <= _ref1 ? ++_j : --_j) {
        red = colors.data[(row * (cvs.width * 4)) + (column * 4)];
        green = colors.data[((row * (cvs.width * 4)) + (column * 4)) + 1];
        blue = colors.data[((row * (cvs.width * 4)) + (column * 4)) + 2];
        index = red + ',' + green + ',' + blue;
        if (!colorCount[index]) {
          colorCount[index] = 0;
        }
        colorCount[index]++;
      }
    }
    possibleColorsSorted = [];
    for (color in colorCount) {
      count = colorCount[color];
      curDark = isDarkColor(color);
      if (curDark === findDarkTextColor) {
        possibleColorsSorted.push([color, count]);
      }
    }
    possibleColorsSorted.sort(function(a, b) {
      return b[1] - a[1];
    });
    for (_k = 0, _len = possibleColorsSorted.length; _k < _len; _k++) {
      color = possibleColorsSorted[_k];
      if (!primaryColor) {
        if (isContrastingColor(color[0], bgcolor)) {
          primaryColor = color[0];
        }
      } else if (!secondaryColor) {
        if (!isDistinct(primaryColor, color[0]) || !isContrastingColor(color[0], bgcolor)) {
          continue;
        }
        secondaryColor = color[0];
      } else if (!detailColor) {
        if (!isDistinct(secondaryColor, color[0]) || !isDistinct(primaryColor, color[0]) || !isContrastingColor(color[0], bgcolor)) {
          continue;
        }
        detailColor = color[0];
        break;
      }
    }
    defaultColor = findDarkTextColor ? "0,0,0" : "255,255,255";
    if (!primaryColor) {
      primaryColor = defaultColor;
    }
    if (!secondaryColor) {
      secondaryColor = defaultColor;
    }
    if (!detailColor) {
      detailColor = defaultColor;
    }
    return cb();
  };
  isBlackOrWhite = function(color) {
    var blue, green, red, splitted, tresholdBlack, tresholdWhite;
    splitted = color.split(',');
    red = splitted[0];
    green = splitted[1];
    blue = splitted[2];
    tresholdWhite = 255 * 0.91;
    tresholdBlack = 255 * 0.09;
    if (red > tresholdWhite && green > tresholdWhite && blue > tresholdWhite) {
      return true;
    }
    if (red < tresholdBlack && green < tresholdBlack && blue < tresholdBlack) {
      return true;
    }
    return false;
  };
  isDarkColor = function(color) {
    var blue, green, lum, red, splitted;
    if (color) {
      splitted = color.split(',');
      red = splitted[0] / 255;
      green = splitted[1] / 255;
      blue = splitted[2] / 255;
      lum = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      return lum < 0.5;
    }
    return false;
  };
  isContrastingColor = function(color1, color2) {
    var blue1, blue2, contrast, green1, green2, lum1, lum2, red1, red2, splitted1, splitted2;
    splitted1 = color1.split(',');
    red1 = splitted1[0] / 255;
    green1 = splitted1[1] / 255;
    blue1 = splitted1[2] / 255;
    lum1 = 0.2126 * red1 + 0.7152 * green1 + 0.0722 * blue1;
    splitted2 = color2.split(',');
    red2 = splitted2[0] / 255;
    green2 = splitted2[1] / 255;
    blue2 = splitted2[2] / 255;
    lum2 = 0.2126 * red2 + 0.7152 * green2 + 0.0722 * blue2;
    if (lum1 > lum2) {
      contrast = (lum1 + 0.05) / (lum2 + 0.05);
    } else {
      contrast = (lum2 + 0.05) / (lum1 + 0.05);
    }
    return contrast > 1.6;
  };
  return isDistinct = function(color1, color2) {
    var blue1, blue2, green1, green2, red1, red2, splitted1, splitted2, treshold;
    splitted1 = color1.split(',');
    red1 = splitted1[0] / 255;
    green1 = splitted1[1] / 255;
    blue1 = splitted1[2] / 255;
    splitted2 = color2.split(',');
    red2 = splitted2[0] / 255;
    green2 = splitted2[1] / 255;
    blue2 = splitted2[2] / 255;
    treshold = 0.25;
    if (Math.abs(red1 - red2) > treshold || Math.abs(green1 - green2) > treshold || Math.abs(blue1 - blue2) > treshold) {
      if (Math.abs(red1 - green1) < .03 && Math.abs(red1 - blue1) < .03) {
        if (Math.abs(red2 - green2) < .03 && Math.abs(red2 - blue2) < .03) {
          return false;
        }
      }
      return true;
    }
    return false;
  };
};
function setupCopyTooltip(el) {
  var copiedMessage = $('.copied-message');
  copiedMessage.hide();
  var client = new ZeroClipboard(el);
  client.on('ready', function(readyEvent) {
    client.on('copy', function(event) {
      var clipboard = event.clipboardData;
      clipboard.setData('text/plain', el.attr('data-tooltip'));
    });
    client.on('aftercopy', function(event) {
      copiedMessage.fadeIn('fast');
      setTimeout(function() {
        copiedMessage.fadeOut('fast');
      }, 2000);
    });
  });
}
function setCreatePaletteLink() {
  var colourLoversUrl = 'http://www.colourlovers.com/palettes/add?colors=';
  var hexCodes = [];
  for (var colorType in Colors) {
    var hex = Colors[colorType];
    hexCodes.push(hex.replace(/^#/, ''));
  }
  colourLoversUrl += hexCodes.join(',');
  $('.colourlovers-link').attr('href', colourLoversUrl);
}
function setSwatchColors() {
  setCreatePaletteLink();
  var bgSwatch = $('.background-swatch');
  bgSwatch.css('background-color', Colors.background).
           attr('data-tooltip', Colors.background);
  setupCopyTooltip(bgSwatch);
  var secondarySwatch = $('.secondary-swatch');
  secondarySwatch.css('background-color', Colors.secondary).
                  attr('data-tooltip', Colors.secondary);
  setupCopyTooltip(secondarySwatch);
  var primarySwatch = $('.primary-swatch');
  primarySwatch.css('background-color', Colors.primary).
                attr('data-tooltip', Colors.primary);
  setupCopyTooltip(primarySwatch);
  var accentSwatch = $('.accent-swatch');
  accentSwatch.css('background-color', Colors.accent).
               attr('data-tooltip', Colors.accent);
  setupCopyTooltip(accentSwatch);
  var tertiarySwatch = $('.tertiary-swatch');
  tertiarySwatch.css('background-color', Colors.tertiary).
               attr('data-tooltip', Colors.tertiary);
  setupCopyTooltip(tertiarySwatch);
}
function translateColors(backgroundRGB, primaryRGB, secondaryRGB, accentRGB) {
  var background = tinycolor('rgb(' + backgroundRGB + ')');
  var primary = tinycolor('rgb(' + primaryRGB + ')');
  var secondary = tinycolor('rgb(' + secondaryRGB + ')');
  var accent = tinycolor('rgb(' + accentRGB + ')');
  Colors.background = background.toHexString();
  Colors.primary = primary.toHexString();
  Colors.secondary = secondary.toHexString();
  Colors.accent = accent.toHexString();
  Colors.tertiary = primary.monochromatic()[1].toHexString();
}
function setColorsFromImage(activeLi) {
  var originalUrl = $('.steam-screenshot').attr('src');
  var url = '/image?url=' + encodeURIComponent(originalUrl);
  var imageList = $('.pagination');
  ImageAnalyzer(url, function(background, primary, secondary, accent) {
    translateColors(background, primary, secondary, accent);
    $('body').css('background-color', Colors.background).
              css('color', Colors.accent).
              attr('data-secondary', secondary);
    $('.top-nav, #steam-friends-dropdown').
        css('background-color', Colors.secondary);
    $('.page-title, .top-nav').css('color', Colors.background);
    $('a').css('color', Colors.secondary);
    $('.top-nav a, #steam-friends-dropdown a').css('color', Colors.tertiary);
    if (typeof activeLi === 'undefined') {
      activeLi = $('li.active');
    }
    activeLi.css('background-color', Colors.secondary);
    activeLi.find('a').css('color', Colors.background);
    activeLi.addClass('active');
    $('.screenshot-wrapper').fadeIn('fast');
    $('.extracting-colors').hide();
    setSwatchColors();
  });
}
function getImageHeight() {
  var topOffset = $('header').height();
  var viewportHeight = $(window).height();
  var imageListHeight = $('.pagination').height();
  var cardActionHeight = 63;
  var steamLinkHeight = 22;
  var titleHeight = 27;
  var topPadding = 50;
  var imageHeight = viewportHeight - topOffset - imageListHeight -
                    cardActionHeight - steamLinkHeight - titleHeight -
                    topPadding;
  return imageHeight;
}
function setImageHeight() {
  var img = $('.steam-screenshot');
  if (img.attr('src') === '') {
    return;
  }
  img.css('max-height', getImageHeight());
}
function loadImageFromLink(link) {
  $('.extracting-colors').show();
  var oldLink = $('.pagination li.active a');
  var oldLinkColor = $('body').attr('data-secondary');
  oldLink.removeAttr('style').css('color', 'rgb(' + oldLinkColor + ')');
  $('.pagination li.active').removeAttr('style').removeClass('active');
  $('.screenshot-wrapper').fadeOut('fast');
  var steamUrl = link.attr('data-steam-url');
  var title = link.attr('data-title');
  var imageUrl = link.attr('href');
  var img = $('.steam-screenshot');
  img.attr('src', imageUrl).load(setImageHeight);
  img.closest('a').attr('href', imageUrl);
  $('.steam-link').attr('href', steamUrl);
  $('.steam-screenshot-title').text(title);
  setColorsFromImage(link.closest('li'));
}
function getSteamAppDetails(screenshotDetailsUrl) {
  var steamAppName = $('.steam-app-name');
  var steamAppLink = $('.steam-app-link');
  var steamAppLinkWrapper = $('.steam-app-wrapper');
  var url = SteamyConfig.rssServiceUrl + '/app_for_screenshot.json?url=' +
            encodeURIComponent(screenshotDetailsUrl);
  $.getJSON(url, function(data) {
    steamAppName.text(data.name);
    steamAppLink.attr('href', data.url);
    steamAppLinkWrapper.fadeIn('fast');
  }).error(function() {
    console.error('failed to fetch Steam app details');
    steamAppName.text('');
    steamAppLink.attr('href', '');
    steamAppLinkWrapper.hide();
  });
}
function listImage(steamUrl, imageUrl, title, pageIndex, page) {
  var imageList = $('.pagination');
  var steamScreenshot = $('.steam-screenshot');
  var steamLink = $('.steam-link');
  var screenshotTitle = $('.steam-screenshot-title');
  var li = $('<li>');
  li.addClass('waves-effect');
  if (pageIndex === page) {
    getSteamAppDetails(steamUrl);
    steamScreenshot.attr('src', imageUrl).load(setImageHeight);
    steamScreenshot.closest('a').attr('href', imageUrl);
    steamLink.attr('href', steamUrl);
    screenshotTitle.text(title);
    setColorsFromImage(li);
  }
  var link = $('<a>');
  link.attr('href', imageUrl).
       attr('data-steam-url', steamUrl).
       attr('data-title', title).
       text(pageIndex);
  li.append(link);
  imageList.append(li);
}
function listImagesFromRSS(page) {
  var imageList = $('.pagination');
  var pageIndex = 1;
  if (typeof page === 'undefined') {
    page = 1;
  }
  var screenshotEntries = RSS.find('entry');
  if (screenshotEntries.length < 1) {
    $('.no-screenshots').show();
    return;
  }
  $('.extracting-colors').show();
  screenshotEntries.each(function() {
    var entry = $(this);
    var imageUrl = entry.find('summary').text();
    var steamUrl = entry.find('link').attr('href');
    var title = entry.find('title').text();
    listImage(steamUrl, imageUrl, title, pageIndex, page);
    pageIndex++;
  });
  if (imageList.find('li').length > 1) {
    imageList.fadeIn('fast');
  }
}
function resetUser() {
  $('.no-screenshots').hide();
  $('#steam-friends-dropdown').empty();
  $('.screenshot-wrapper').fadeOut('fast');
  $('.pagination').empty().fadeOut('fast');
  $('body, a, .page-title, .top-nav, nav .input-field label.active i, ' +
    'input, .metadata .swatch, #steam-friends-dropdown').removeAttr('style');
  $('.steam-user-nav').fadeOut('fast');
  $('.top-nav .steam-user-name, ' +
    '.top-nav .steam-app-name').fadeOut('fast').text('');
  $('.steam-app-wrapper').fadeOut('fast');
  $('.steam-app-link').attr('href', '');
  $('.steam-app-name').text('');
  $('.steam-user-profile-link').attr('href', '').fadeOut('fast');
  $('#search-container').fadeOut('fast');
}
function fetchSteamFriends(steamUser) {
  var url = '/steam_friends.json?user=' + encodeURIComponent(steamUser);
  $.getJSON(url, function(friends) {
    var friendsList = $('#steam-friends-dropdown');
    for (var i=0; i<friends.length; i++) {
      var friend = friends[i];
      var li = $('<li>');
      var link = $('<a>');
      link.attr('href', '#' + friend.steamId);
      link.text(friend.name);
      li.append(link);
      friendsList.append(li);
    }
    if (friends.length > 0) {
      $('.steam-user-nav').fadeIn('fast');
      if (Colors.primary) {
        friendsList.find('a').css('color', Colors.primary);
      }
    }
    $('.top-nav .steam-user-name').fadeIn('fast').text(steamUser);
  }).error(function() {
    console.error('failed to fetch Steam friends for', steamUser);
    $('.steam-user-nav').fadeOut('fast');
    $('.top-nav .steam-user-name').fadeOut('fast').text('');
  });
}
function listImagesFromAppScreenshots(page) {
  if (SteamAppScreenshots.length < 1) {
    $('.no-screenshots').show();
  }
  var imageList = $('.pagination');
  var steamAppId = $('body').attr('data-steam-app');
  $('body').attr('data-steam-app', steamAppId);
  $('.top-nav .steam-app-name').fadeIn('fast').
                                text(SteamAppData[steamAppId]);
  $('.extracting-colors').show();
  for (var i=0; i<SteamAppScreenshots.length; i++) {
    var screenshot = SteamAppScreenshots[i];
    if (screenshot.userUrl && screenshot.userUrl !== '') {
      $('.steam-user-profile-link').attr('href', screenshot.userUrl).
                                    fadeIn('fast');
    }
    listImage(screenshot.detailsUrl, screenshot.fullSizeUrl,
              screenshot.title, i + 1, page);
  }
  if (imageList.find('li').length > 1) {
    imageList.fadeIn('fast');
  }
}
function fetchSteamApp(steamAppId, page) {
  $('#main-steam-user-lookup-form').fadeOut('fast');
  $('#main-steam-app-lookup-form').fadeOut('fast');
  if (typeof page === 'undefined') {
    page = 1;
  }
  resetUser();
  RSS = {};
  var currentSteamApp = $('body').attr('data-steam-app');
  if (currentSteamApp === steamAppId) {
    listImagesFromAppScreenshots(page);
  } else {
    $('body').attr('data-steam-app', steamAppId);
    Colors = {};
    SteamAppScreenshots = [];
    var jsonUrl = SteamyConfig.rssServiceUrl +
                  '/app_screenshots.json?app_id=' + steamAppId;
    var loadingMessage = $('.loading-steam-app');
    loadingMessage.show();
    $.getJSON(jsonUrl, function(screenshots) {
      SteamAppScreenshots = screenshots;
      loadingMessage.hide();
      listImagesFromAppScreenshots(page);
    }).error(function() {
      console.error('failed to load Steam app screenshots');
      loadingMessage.hide();
    });
  }
}
function fetchSteamUser(steamUser, page) {
  $('#main-steam-user-lookup-form').fadeOut('fast');
  $('#main-steam-app-lookup-form').fadeOut('fast');
  resetUser();
  fetchSteamFriends(steamUser);
  var url = 'http://steamcommunity.com/id/' + steamUser;
  $('.steam-user-profile-link').attr('href', url).fadeIn('fast');
  var currentSteamUser = $('body').attr('data-steam-user');
  if (currentSteamUser === steamUser) {
    listImagesFromRSS(page);
  } else {
    RSS = {};
    Colors = {};
    var rssServiceUrl = SteamyConfig.rssServiceUrl;
    var feedUrl = rssServiceUrl + '?user=' + encodeURIComponent(steamUser);
    var loadingMessage = $('.loading-steam-user');
    loadingMessage.show();
    $.get(feedUrl, function(rss) {
      loadingMessage.hide();
      RSS = $(rss);
      listImagesFromRSS(page);
      $('body').attr('data-steam-user', steamUser);
    });
  }
}
function showSteamForm() {
  resetUser();
  $('#main-steam-user-lookup-form').fadeIn('fast');
  $('#steam-user-name').focus();
  $('#main-steam-app-lookup-form').fadeIn('fast');
}
function extractUrlBit(routePrefix) {
  var hash = window.location.hash;
  var routePrefixIndex = hash.indexOf(routePrefix);
  if (routePrefixIndex > -1) {
    var startIndex = routePrefixIndex + routePrefix.length;
    var nextSlashIndex = hash.indexOf('/', startIndex);
    var endIndex;
    if (nextSlashIndex > -1) {
      endIndex = Math.min(nextSlashIndex, hash.length);
    } else {
      endIndex = hash.length;
    }
    return hash.slice(startIndex, endIndex);
  }
  return '';
}
function getSteamUserFromUrl() {
  return extractUrlBit('steam/user/');
}
function getSteamAppIdFromUrl() {
  return extractUrlBit('steam/app/');
}
function getPageFromUrl() {
  var pageStr = extractUrlBit('page/');
  if (pageStr === '') {
    return -1;
  }
  return parseInt(pageStr, 10);
}
function parseLocation() {
  var steamUser = getSteamUserFromUrl();
  var steamAppId = getSteamAppIdFromUrl();
  if (steamUser === '' && steamAppId === '') {
    showSteamForm();
  } else if (steamUser !== '') {
    var page = getPageFromUrl();
    if (page > 0) {
      fetchSteamUser(steamUser, page);
    } else {
      fetchSteamUser(steamUser);
    }
  } else {
    var page = getPageFromUrl();
    if (page > 0) {
      fetchSteamApp(steamAppId, page);
    } else {
      fetchSteamApp(steamAppId);
    }
  }
}
$(function() {
  var configFetcher = $.getJSON('/config.json').
      error(function(jqXHR, textStatus, error) {
        $('.error-message').text('Failed to load config.json').fadeIn('fast');
      });
  configFetcher.then(function(config) {
    SteamyConfig = config;
  });

  $('body').on('click', '.pagination a', function(event) {
    event.preventDefault();
    var link = $(this);
    var page = parseInt($.trim(link.text()), 10);
    var steamUser = getSteamUserFromUrl();
    var steamAppId = getSteamAppIdFromUrl();
    var hash = 'steam/';
    if (steamUser !== '') {
      hash += 'user/' + steamUser;
    } else if (steamAppId !== '') {
      hash += 'app/' + steamAppId;
    }
    if (page !== 1) {
      hash += '/page/' + page;
    }
    window.location.hash = hash;
  });

  $('body').on('click', '#steam-friends-dropdown a', function(event) {
    event.preventDefault();
    var link = $(this);
    var steamUser = link.text();
    window.location.hash = 'steam/user/' + steamUser;
  });

  var appData = $.getJSON('/steam_apps.json');
  appData.then(function(apps) {
    for (var i=0; i<apps.length; i++) {
      SteamAppData[apps[i].appid] = apps[i].name;
    }
  });

  var indexDump = $.getJSON('/steam_apps_index.json');
  indexDump.then(function(indexData) {
    appData.then(function() {
      SteamAppIndex = lunr.Index.load(indexData);
      parseLocation();
    });
  });

  $(window).on('resize', setImageHeight).
            on('hashchange', parseLocation);

  var searchForSteamApp = function() {
    var form = $('#main-steam-app-lookup-form');
    var searchContainer = $('#search-container');
    var resultsList = $('.app-search-results');
    var appQuery = $.trim(form.find('.steam-app-name').val());
    if (appQuery === '') {
      resultsList.empty();
      searchContainer.fadeOut('fast');
      return;
    }
    var results = SteamAppIndex.search(appQuery);
    appData.then(function(apps) {
      indexDump.then(function(indexData) {
        resultsList.empty();
        if (results.length > 0) {
          resultsList.append(results.map(function(result) {
            var li = $('<li>');
            var link = $('<a>');
            link.attr('href', '#steam/app/' + result.ref);
            link.text(SteamAppData[result.ref]);
            li.append(link);
            return li;
          }));
        } else {
          var li = $('<li>');
          li.text('No matching games found');
          resultsList.append(li);
        }
        searchContainer.fadeIn('fast');
      });
    });
  };

  var searchTimer;
  $('.steam-app-lookup-form .steam-app-name').on('keyup', function() {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    searchTimer = setTimeout(searchForSteamApp, 1000);
  });

  $('.steam-app-lookup-form').on('submit', function(event) {
    event.preventDefault();
    searchForSteamApp();
  });

  $('.steam-user-lookup-form').on('submit', function(event) {
    event.preventDefault();
    var steamUser = $.trim($(this).find('.steam-user-name').val());
    if (steamUser === '') {
      window.location.hash = '';
    } else {
      window.location.hash = 'steam/user/' + steamUser;
    }
  });
});
