$(document).ready(function() {

  // setup moviedb api stuff
  modb.moviedb.setup();

  /* seach box - freebase search widget*/

  // info at https://developers.google.com/freebase/v1/search-widget
	$("#search-box").suggest({ 
		key: "AIzaSyDn-Uf8d5KcZvD6wNoGi_o18laKe1xoVhE",
		filter: '(all type:/film/film)',
		advanced: false,
		flyout: false
	});

  /* Home page content loading */

  // load slides
	modb.slides.loadSlides();
	// load initial upcoming
	modb.posters.loadUpcoming();
	// update upcoming poster at interval
	// TODO: continues to be called when hidden etc...
	window.setInterval(function() {
		// doesn't seem to work unless in a function?
		modb.posters.loadUpcoming();
	}, 60000);
	// load initial page of populars
	modb.posters.loadPopular();

	/* assign actions to the various buttons */

	$("#home-button").on("click", function(e) {
		e.preventDefault();
		$("#modb-movie-info").remove();
		$("#modb-search-results").remove();
		$("#home-container").show();
		window.location.replace(location.origin + "/#");
	});	

	$("#help-button").on("click", function(e) {
		e.preventDefault();
		$("#help-panel").slideToggle();
	});

	$("#help-panel").on("click", function(e) {
		e.preventDefault();
		$("#help-panel").slideUp();
	});

	$("#search-button").on("click", modb.search.doSearch);

	/* Infinite Scroll - for popular posters */

	$(window).scroll(function()	{
	  if($(window).scrollTop() == $(document).height() - $(window).height()) {
	  	console.log("scroll call!");
      modb.posters.morePopular();
    }
   });

	/* Hash Change */

	var hashChange = function() {
		var hash = location.hash;
		if (hash.length !== 0) {
			console.log(hash);
			var id = hash.slice(1);
			// hide all
			$('#home-container').hide();
			// get movie by id
			modb.view.loadMoiveInfo(id);
			
			console.log("hash change fired: " + location.hash);
		}
	};

	$(window).on('hashchange', hashChange);
	hashChange(); // call on load in case url has a hash

	/* Slide click links */

	var slidesOn = function(event) {
		$(this).css("cursor", "pointer");
	};

	var slidesOut = function(event) {
		$(this).css("cursor", "default");
	};

	$("#slides").hover(slidesOn, slidesOut);
	$("#slides").on("click", function(event) {
		var $anchor, hash, link;
		$anchor = $(this).parent().find("#slide-caption a");
		link = location.origin + '/' + $anchor.attr("href");
		window.location.replace(link);
	});

	
	/* Assign actions to any poster elements on ajax completion */	

	// clear all poster actions, and add click and hover actions for all
	var posterActions = function() {
		var $panels = $("div.modb-thumb img");
		if ($panels.length > 0) {
			// clear previous event bindings
			// (otherwise get multiple hits)
			$panels.off();
			$panels.hover(tipOver, tipOut);
			$panels.on("click", function(event) {
				var t, hash;
				t = $(this).attr("alt").split('-');
				hash = t[t.length - 1];
				window.location.replace(location.origin + '/#' + hash);
			});
		} 
	};

	// when an ajax call is finished run posterActions()
	$(document).bind("ajaxComplete", posterActions);

	
	// action for mouse over on poster thumbs
	var tipOver = function(event) {
		/*var xoff = event.offsetX, yoff = event.offsetY;*/
		$(this).css("-webkit-filter", "grayscale(90%)").css("cursor", "pointer");
		$tip = $(this).parents(".columns").first().find("div.pop-tip");
		//$tip = $(this).parent().find("div.pop-tip");
		/*$tip.css("top", yoff).css("left", xoff);*/
		$tip.fadeToggle();
		console.log("over: " + $(this).attr("alt"));
	};

	// action for mouse out on poster thumbs
	var tipOut = function(event) {
		/*var xoff = event.offsetX, yoff = event.offsetY;*/
		$(this).css("-webkit-filter", "grayscale(0%)").css("cursor", "default");
		$tip = $(this).parents(".columns").first().find("div.pop-tip");
		//$tip = $(this).parent().find("div.pop-tip");
		/*$tip.css("top", yoff).css("left", xoff);*/
		$tip.toggle();
		console.log("out: " + $(this).attr("alt"));
	};

});