/**
 *	Module for the movie view
 */
modb.view = (function () {


	/* modify the upcoming poster row */
	var displayMovieInfo = function(json) {
		$.when($.get("templates/movie-info.html.mustache"), 
			$.get("templates/movie-images.html.mustache"))
			.done(function(info, images) {
				//console.log(json);
				// render template using partial strings aswell
				var outInfo = Mustache.render(info[0], json);
				//console.log(outInfo);
				var outImages = Mustache.render(images[0], json);
				//console.log(outImages);
				// clear any previous info first
				$("#modb-movie-info").remove();
				$("#modb-search-results").remove();
				// add new to content
				$("#modb-content").append(outInfo);
				if (json.backdrops.length > 0)
					$(".modb-view-info").append(outImages);
				$(".fancybox").fancybox();
			});
	};

	var displayMovieImages = function(json) {
		$.get("templates/movie-images.html.mustache", function(html) {
			// render template using partial strings aswell
			var out = Mustache.render(html, json);			

			$("#modb-view-info").append(out);
		});
	};

	var loadMoiveInfo = function(movie_id) {
		console.log("calling: loadMovieInfo");
		modb.moviedb.getMovieInfo(movie_id, displayMovieInfo);
	};

	return {
		loadMoiveInfo: loadMoiveInfo
	};

})();