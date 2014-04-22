modb.slides = (function () {

	var modifySlider = function(json) {
		// tidy json data
		var i = 0, items = [], htmlout = '';
		// update the image and caption elements
		items = json.results;
		for (i = 0; i < items.length; i++) {
			htmlout += '<img src="' + items[i].backdrop_url + '" alt="' 
				+ items[i].title + '-' + items[i].id + '">';
		}
		$('#slides').html(htmlout);
		$('#slide-caption').html('<a href="#' + items[0].id + '" alt="' 
    	+ items[0].title + '">' + items[0].title + '</a>');
		$("#slides").slidesjs({
	    width: 960,
	    height: 480,
	    play: {
        active: false,
        auto: true,
        interval: 6000
      },
      navigation: {
      	active: false
      },
      pagination: {
      	active: false
    	},
    	effect: {
      	slide: {
	        speed: 1200
	      }
	    },
      callback: {
        complete: function(number) {
          // Change slide number on animation complete
          var capIdx = number - 1;
          $('#slide-caption').html('<a href="#' + items[capIdx].id + '" alt="' 
          	+ items[capIdx].title + '">' + items[capIdx].title + '</a>');
        }
      }
	  });
		// hide loading indicator
		$("#modb-slide-loading").hide();
	};

	/* load the slider elements with new data */
	var loadSlides = function() {
		$("#modb-slide-loading").show();
		modb.moviedb.getMovieList("playing", 1, modifySlider);
	};

	return {
		loadSlides: loadSlides
	};

})(); // end modb.slides