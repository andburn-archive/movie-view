/**
 *	Module to deal with poster views
 */
modb.posters = (function () {

	/* html to be used in mustache partials */
	var row_header = '<div class="row modb-row-header"><div class="large-12 columns">'
			+ '<h3 class="modb-row-title">{{row_title}}</h3></div></div>',
		row_poster = '<input class="row-page" type="hidden" value="{{page}}" />'
			+ '{{#results}}<div class="large-3 small-6 columns">'
			+ '<div class="modb-thumb"><img src="{{poster_url}}" alt="{{title}}-{{id}}">'
      + '</div><div class="pop-tip"><strong>{{title}}</strong><br />{{release}}' 
      + '</div></div>{{/results}}',
    partials = { 
			row_header: row_header, 
			row_poster: row_poster 
		};

	/** -------- Helper Methods  -------- **/

	/*
	 *	shuffle an array
	 */
	var shuffle = function(o) {
		var j, x, i;
    for (i = o.length - 1; i >= 0; i--) {
    	j = Math.floor(Math.random() * i);
    	x = o[i];
    	o[i] = o[j];
    	o[j] = x;
		}
    return o;
	};

	/** -------- Methods for Upcoming  -------- **/

	/* modify the upcoming poster row */
	var modifyUpcoming = function(json) {
		// shuffle the results and pick first four
		json.results = shuffle(json.results).slice(0, 4);
		json.row_title = "Upcoming";
		$.get("templates/poster-row.html.mustache", function(html) {
			// render template using partial strings aswell
			var out = Mustache.render(html, json, partials);
			// replace existing content
			$("#modb-upcoming").html(out);
		});
	};

	/* get the list of upcoming movies using Ajax */
	var loadUpcoming = function() {
		console.log("calling: loadUpcoming");
		var randomPage = Math.floor(Math.random() * 2 + 1); // [1-2]
		modb.moviedb.getMovieList("upcoming", randomPage, modifyUpcoming);
	};

	/** -------- Methods for Popular  -------- **/

	/* loads popular posters setups layout, and adds first page */
	var loadPopular = function() {
		// show loading image
		$('#modb-popular-loading').show();
		// run ajax call to get results
		modb.moviedb.getMovieList("popular", 1, function(json) {
			json.row_title = "Popular";
			$.get("templates/poster-row.html.mustache", function(html) {
				// render template with partials
				var out = Mustache.render(html, json, partials);
				// replace existing content
				$("#modb-popular").html(out);
				// hide loading image
				$('#modb-popular-loading').hide();
			});
		});
	};

	/* does actual appending of content to DOM */
	var appendPopular = function(json) {
			// render row contents, not all layout
			var out = Mustache.render(row_poster, json);
			// insert new content into existing row, better flow
			$("#modb-popular div.modb-poster-row").append(out);
			// hide loading graphic
			$('#modb-popular-loading').hide();
			// move loading graphic to bottom of div
			$('#modb-popular-loading').appendTo($("#modb-popular"));
	};

	/* load another page of popular results */
	var morePopular = function() {
		// get the last page number fetched, using created input tags
		var pagenum = $("input.row-page").last().val(), 
			pageLimit = 20;
		// check page is a number
		num = parseInt(pagenum);
		if (isNaN(num)) {
			console.log("error: pagenum = " + pagenum);
		} else {
			if (num <= pageLimit) {
				// show loading image
				$('#modb-popular-loading').show();
				// use ajax to get another page of results
				modb.moviedb.getMovieList("popular", num + 1, appendPopular);
			} else {
				// if page is greater than limit, don't load any more
				$('#modb-popular-loading').html('That\'s all, Sorry.').show();
			}
		}
	};

	// exported methods
	return {
		loadUpcoming: loadUpcoming,
		loadPopular: loadPopular,
		morePopular: morePopular
	};

})();