modb.moviedb = (function () {
	
	/** -------- Variables -------- **/

	var moviedbApiKey = "api_key=5c074f8ae06e21d6bea2292052300258",
		moviedbBaseUrl = "https://api.themoviedb.org/3/",
		language = "&language=en",
		popularUrl = moviedbBaseUrl + "movie/popular?" + moviedbApiKey + language,
		upcomingUrl = moviedbBaseUrl + "movie/upcoming?" + moviedbApiKey + language,
		playingUrl = moviedbBaseUrl + "movie/now_playing?" + moviedbApiKey + language,
		topUrl = moviedbBaseUrl + "movie/top_rated?" + moviedbApiKey + language,
		configUrl = moviedbBaseUrl + "configuration?" + moviedbApiKey,
		baseImageUrl = "http://image.tmdb.org/t/p/",
		posterSizes = ["original"],
		backdropSizes = ["original"]
	;

	/** -------- Helper Methods -------- **/

	var getArtworkSize = function(index, array) {
		var limit = 4, 
			len = array.length, 
			start = 0;
		if (len >= limit) {
			start = len - limit;
			return array[start + index];
		} else {
			return array[len - 1];
		}
	};

	var createImageUrl = function(type, size, filename) {
		var index, len, url = baseImageUrl;

		if (filename === null) {
			return "images/no_" + type + ".png";
		}

		switch(size) {
			case "small": index = 0; break;
			case "medium": index = 1; break;
			case "large": index = 2; break;
			default: index = 3; break;
		}

		if (type === "backdrop") {
			url += getArtworkSize(index, backdropSizes);
		} else {
			url += getArtworkSize(index, posterSizes);
		}

		return url + filename;
	};

	/** -------- Configuration (themoviedb) -------- **/

	var setup = (function() {
		$.getJSON(configUrl, function(json) {
			baseImageUrl = json.images.base_url || baseImageUrl;
			posterSizes = json.images.poster_sizes || posterSizes;
			backdropSizes = json.images.backdrop_sizes || backdropSizes;
		});
	});

	/** -------- MovieDB lists Methods  -------- **/

	var tidyMovieListJson = function(json, callback) {
		var list = json.results, i, r, backdrop, poster, date, jsonResults = [];

		for (i = 0; i < list.length; i++) {
			r = list[i];
			// check result has available images to use
			if (r.backdrop_path === null || r.poster_path === null) {
				// if not skip this result
				continue;
			}
			// get full urls for images
			backdrop = createImageUrl("backdrop", "large", r.backdrop_path);
			poster = createImageUrl("poster", "medium", r.poster_path);
			// format release date easily, with 'momentjs'
			date = moment(r.release_date).format('Do MMM, YYYY');

			jsonResults.push({
				backdrop_url: backdrop,
				poster_url: poster,
				title: r.title,
				release: date,
				popularity: r.popularity,
				id: r.id
			});
		}
		
		callback({ results: jsonResults, page: json.page });
	};

	var getMovieList = function(type, num, callback) {
		var url = '',
			page = parseInt(num),
			list = type.toLowerCase();

		// check page is a valid number
		if (isNaN(page)) {
			page = 1;
		}
		page = "&page=" + page;
		// set the url based on type arg
		switch (list) {
			case "upcoming":
				url = upcomingUrl + page; break;
			case "popular":
				url = popularUrl + page; break;
			case "playing":
				url = playingUrl + page; break;
			default:
				url = topUrl + page;
		}

		if (typeof callback === "function") {
			// do ajax call, passing on callback function arg
			$.getJSON(url, function(data) { tidyMovieListJson(data, callback); });
		} else {
			// if callback not a function, skip ajax call
			console.log(callback + " is not a function.")
		}
	};


	/** -------- MovieDB info Methods  -------- **/

	var tidyMovieInfoJson = function(info, images, callback) {
		var backdrop, poster, date, year, jsonOut = info[0];

		backdrop = createImageUrl("backdrop", "large", jsonOut.backdrop_path);
		poster = createImageUrl("poster", "medium", jsonOut.poster_path);

		// format release date easily, with 'momentjs'
		date = moment(jsonOut.release_date).format('Do MMM, YYYY');
		year = moment(jsonOut.release_date).format('YYYY');

		jsonOut.backdrop_url = backdrop;
		jsonOut.poster_url = poster;
		jsonOut.release = date;
		jsonOut.year = year;

		// add images too
		var backdrops = images[0].backdrops, 
			list = [], 
			end, i, blen;
		blen = backdrops.length;
		// only want multiples of four (or less than 4)
		end = blen - (blen % 4);
		for(i = 0; i < end; i++) {
			list.push({
				thumb_url: createImageUrl("backdrop", "small", backdrops[i].file_path),
				full_url: createImageUrl("backdrop", "large", backdrops[i].file_path)
			});
		}

		jsonOut.backdrops = list;
		
		callback(jsonOut);
	};


	var getMovieInfo = function(mid, callback) {
		// make sure mid is defined and not empty
		if (!mid || mid.length === 0) {
			console.log("movie id (" + mid + "), is empty or undefined.");
			return;
		}
		var infoUrl = moviedbBaseUrl + "movie/" + mid + "?" + moviedbApiKey + language;
		var imagesUrl = moviedbBaseUrl + "movie/" + mid + "/images?" + moviedbApiKey;
		if (typeof callback === "function") {
			// do ajax call, using given callback function
			//$.getJSON(url, function(data) { tidyMovieInfoJson(data, callback); });
			$.when($.getJSON(infoUrl), 
				$.getJSON(imagesUrl))
			.done(function(info, images) { tidyMovieInfoJson(info, images, callback); });
		} else {
			// if callback not a function, skip ajax call
			console.log(callback + " is not a function.")
		}
	};

	/** -------- MovieDB extra images Methods  -------- **/

	var tidyMovieImagesJson = function(json, callback) {
		var backdrops = json.backdrops, 
			list = [],
			jsonOut = {}, i;
		for(i = 0; i < backdrops.length; i++) {
			list.push({
				thumb_url: createImageUrl("backdrop", "small", backdrops[i].file_path),
				full_url: createImageUrl("backdrop", "large", backdrops[i].file_path)
			});
		}
		callback({ backdrops: list });
	};

	var getMovieImages = function(mid, callback) {
		// make sure mid is defined and not empty
		if (!mid || mid.length === 0) {
			console.log("movie id (" + mid + "), is empty or undefined.");
			return;
		}
		var url = moviedbBaseUrl + "movie/" + mid + "/images?" + moviedbApiKey + language;
		if (typeof callback === "function") {
			// do ajax call, using given callback function
			$.getJSON(url, function(data) { tidyMovieImagesJson(data, callback); });
		} else {
			// if callback not a function, skip ajax call
			console.log(callback + " is not a function.")
		}
	};

	/** -------- MovieDB search Methods  -------- **/

	var tidyMovieSearchJson = function(data, callback) {
		var results = data.results;
		console.log(data);
		results.forEach(function(element, index, array) {
			element.poster_url = createImageUrl("poster", "small", element.poster_path);
			element.year = moment(element.release_date).format("YYYY");
		});
		results.sort(function(a, b) {
			return b.popularity - a.popularity;
		});
		callback({results: results});
	}

	var getMovieSearchResults = function(query, callback) {
		var queryEscaped = encodeURIComponent(query);
		var url = moviedbBaseUrl + "search/movie?query=" + queryEscaped
			+ "&include_adult=false&" + moviedbApiKey + language;
		if (typeof callback === "function") {
			// do ajax call, passing on callback function arg
			$.getJSON(url, function(data) { tidyMovieSearchJson(data, callback); });
		} else {
			// if callback not a function, skip ajax call
			console.log(callback + " is not a function.")
		}

	}

	/* 'publicly' avialable mehtods */
	return { 
		setup: setup,
		getMovieList: getMovieList,
		getMovieInfo: getMovieInfo,
		getMovieImages: getMovieImages,
		getMovieSearchResults: getMovieSearchResults
	};

})(); // end modb.moviedb
