$(function(){

	DOMAIN = 'http://api.minutesreader.com/';

	/*
		Timer stuff
	*/

	var storage = window.localStorage;
	var readingTimer;

	// The timer is null initially
	storage.setItem('timer', null);

	// Set the timer when the user clicks their timer button
	$('body').on('click', '.start-reading-button', function(){
		// Initialize the timer
		initTimer($('#time-slider').val() * 60 * 1000);
		loadArticle();
	});

	var initTimer = function(val) {
		storage.setItem('timer', val);

		$('.article-footer p').text('You\'ve got more time; go ahead and keep reading!');
		$('.article-footer .ui-btn-text').text('Next');

		readingTimer = window.setInterval(function(){
			// Decrement timer
			var val = storage.getItem('timer');
			val = val - 1000;

			// If it's <= zero, set it to 0 and announce it
			if (val <= 0) {
				val = 0;

				timeUpAlert();
				killTimer();
			}

			// Save the value to local storage
			storage.setItem('timer', val);
		}, 1000)
	}

	var timeUpAlert = function() {
		console.log("Time's up!");

		$('.article-footer p').text('Your time\'s about up! Have a good day.');
		$('.article-footer .ui-btn-text').text('Finish');
	}
	var killTimer = function() {
		window.clearInterval(readingTimer);
	}

	var loadArticle = function(reader, save) {
		if (typeof reader === 'undefined') var reader = $('#reader');
		if (typeof save === 'undefined') var save = false;
		if (save === true) articleID = 0;
		else articleID = window.localStorage.getItem('current_article');

		// Delete old content
		reader.find('.article-text').empty();

		// Hide article footer/show loading indicator
		var uiMore = reader.find('.article-footer').hide(0);
		var uiLoading = reader.find('.loading-text').show(0);

		// Ask for new content
		var params = {
			minutes: storage.getItem('timer') / 1000 / 60,
			current: window.localStorage.getItem('current_article'),
			token: window.localStorage.getItem('access_token'),
		};
		$.get(DOMAIN+'article.json', params, function(data, textStatus, jqXHR) {
			// console.log(data);
			// console.log("Found an article that's "+data.minutes+" minutes long with "+(storage.getItem('timer') / 1000 / 60)+" minutes left.");

			// Fill in content
			var content = $('#reader .article-text');
			$('<h2 />', {text: data.title}).appendTo(content);
			$(data.content).appendTo(content);

			window.localStorage.setItem('current_article', data.id);

			// Show article footer/hide loading indicator
			uiMore.show(0);
			uiLoading.hide(0);

      $(document).trigger('reader:load', data);
		}).fail(function() {
      $(".loading-text").html("Looks like you cleaned your Pocket queue, good job!");
    });
	}

	var nextArticle = function(skip) {
		var $currentPage = $('#reader');
		var $nextPage = $currentPage.clone().attr('id','').insertAfter($currentPage);

		$.mobile.changePage($nextPage, {
			transition: 'slideup',
		});

		window.setTimeout(function(){
			$currentPage.remove();
		}, 1000);
		$nextPage[0].id = 'reader';

		if (typeof skip === 'undefined') var skip = false;
		loadArticle($nextPage, skip);
	}

	// Click events for next/skip buttons
	$('body').on('click', '.next-article-button', function(e) {
		if (window.localStorage.getItem('timer') > 0) {
			nextArticle();
			e.preventDefault();
		}
		else {
			$.mobile.changePage($('#home'), {transition: 'slide'});
		}
	});
	$('body').on('click', '.skip-article-button', function(e) {
		nextArticle(true);
		e.preventDefault();
	});

	/*  ===============
		READER SETTINGS
		===============
	*/

	// Text size
	$('input[name="textSize"]').change(function(){
		var size = $('input[name="textSize"]:checked').val();

		window.localStorage.setItem('text-size', size);
		$('#reader')
			.removeClass('eader-textsize-extrasmall reader-textsize-small reader-textsize-medium reader-textsize-large reader-textsize-extralarge')
			.addClass('reader-textsize-'+size);

	});
	$(document).ready(function(){
		var size = window.localStorage.getItem('text-size');
		if (size !== null) {
			$('input[name="textSize"][value="'+size+'"]').prop('checked', true);
			$('#reader')
				.removeClass('eader-textsize-extrasmall reader-textsize-small reader-textsize-medium reader-textsize-large reader-textsize-extralarge')
				.addClass('reader-textsize-'+size);
		}
	});

// Line height
	$('input[name="lineheight"]').change(function(){
		var color = $('input[name="lineheight"]:checked').val();

		window.localStorage.setItem('lineheight', color);
		$('#reader')
			.removeClass('reader-lineheight-short reader-lineheight-regular reader-lineheight-tall')
			.addClass('reader-lineheight-'+color);

	});
	$(document).ready(function(){
		var color = window.localStorage.getItem('lineheight');
		if (color !== null) {
			$('input[name="lineheight"][value="'+color+'"]').prop('checked', true);
			$('#reader')
				.removeClass('reader-lineheight-short reader-lineheight-regular reader-lineheight-tall')
				.addClass('reader-lineheight-'+color);
		}
	});

	// Font Style
	$('input[name="font"]').change(function(){
		var color = $('input[name="font"]:checked').val();

		window.localStorage.setItem('font', color);
		$('#reader')
			.removeClass('reader-font-sans reader-font-serif')
			.addClass('reader-font-'+color);

	});
	$(document).ready(function(){
		var color = window.localStorage.getItem('lineheight');
		if (color !== null) {
			$('input[name="font"][value="'+color+'"]').prop('checked', true);
			$('#reader')
				.removeClass('reader-font-sans reader-font-serif')
				.addClass('reader-font-'+color);
		}
	});


	// ----------

	$(document).on('pageinit', '#home', function(){
		killTimer();
	});

	$(document).unload(function(){
		document.localStorage.setItem('timer', null);
	});


}); 
