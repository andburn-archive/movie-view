/**
 *	Module for the movie search
 */
modb.search = (function () {

	var displayResults = function(json) {
		console.log(json);
		$.get("templates/movie-search-results.html.mustache", function(html) {
			// render template using partial strings aswell
			var out = Mustache.render(html, json);			
			
			$("#home-container").hide();
			$("#modb-movie-info").remove();
			$("#modb-search-results").remove();
			$("#modb-content").append(out);
		});
	};

	var doSearch = function(event) {
		var searchText = $("#search-box").val();
		event.preventDefault();
		console.log(searchText);
		if (!searchText || /^\s*$/.test(searchText)) {
			// search text is empty, wite to search box
			$("#search-box").val("Enter a movie title here!");
			console.log("empty search box");
		} else {
			modb.moviedb.getMovieSearchResults(searchText, displayResults);
		}
	};

	return {
		doSearch: doSearch
	};

})();