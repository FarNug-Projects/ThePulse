"use strict";
	
	var ECHONEST_SEARCH_URL = "https://api.spotify.com/v1/search?q=";
	var ECHONEST_GET_ARTIST_URL = "http://developer.echonest.com/api/v4/artist/search?api_key=X49FXQLHTSR1RNIBC";
	var ECHONEST_GET_ARTIST_NEWS_URL = "http://developer.echonest.com/api/v4/artist/news?api_key=X49FXQLHTSR1RNIBC";
	var artist;
	var allNews = [];
	var echonestLoaded = false;

	function echonestSearch(artist, articleRange){
		// Builds the artist search url and the news searh url
		var searchArtistURL = ECHONEST_GET_ARTIST_URL + "&name=" + artist;
		var searchNewsURL = ECHONEST_GET_ARTIST_NEWS_URL + "&name=" + artist + "&results=" + articleRange + "&start=0";
		
		$.getJSON(searchArtistURL).done(function(data){echonestArtistSearchJSONLoaded(data);});
		$.getJSON(searchNewsURL).done(function(data){
			echonestNewsSearchJSONLoaded(data);
			buildNewsContainer();
		});

	}

	function echonestArtistSearchJSONLoaded(obj) {
		if(obj.error){
			document.querySelector("#news").innerHTML = "<b>No Results Found</b>";
		} else {
			var allArtists = obj.response.artists;
			artist = allArtists[0].name;
		}
	}
	
	function echonestNewsSearchJSONLoaded(obj) {
		if(obj.error){
			document.querySelector("#news").innerHTML = "<b>No Results Found</b>";
		} else {
			allNews = obj.response.news;
		}
	}
	
	// Builds the news div line by line based on the data in the news array.
	function buildNewsContainer() {
		var html = "";
		var line = "";
		
		for (var i=0; i < allNews.length; i++){
			var title = allNews[i].name;
			var date = allNews[i].date_found;
			var summary = allNews[i].summary;
			var url = allNews[i].url;
			
			line += "<article>";
			line +=  "<h3>";
			line += title;
			line += "</h3>";
			line += "<strong>";
			line += date;
			line += "</strong>";
			line += "<p>";
			line += summary;
			line +=  "</p>";
			line += "<a href=" + url + " target='_blank'>" + url + "</a>";
			line += "</article>";
		}
		html += line;
		
		document.querySelector("#news").innerHTML = html;
		$("#news").fadeIn(1000);
		
		echonestLoaded = true;
	}