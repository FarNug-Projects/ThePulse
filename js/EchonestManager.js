"use strict";
	
	var ECHONEST_SEARCH_URL = "https://api.spotify.com/v1/search?q=";
	var ECHONEST_GET_ARTIST_URL = "http://developer.echonest.com/api/v4/artist/search?api_key=X49FXQLHTSR1RNIBC";
	var ECHONEST_GET_ARTIST_NEWS_URL = "http://developer.echonest.com/api/v4/artist/news?api_key=X49FXQLHTSR1RNIBC";
	var artist;
	var news = [];
	var noArtist;
	var noNews;
	var articles = [];
	var index = 0;
	var echonestLoaded = false;
	
	var next = document.querySelector("#next");
	var previous = document.querySelector("#previous");
	next.addEventListener("click", nextArticle);
	previous.addEventListener("click", previousArticle);
	
	function nextArticle(){
		index++;
		if(index >= articles.length) {
			index = 0;
		}
		displayArticle(index);		
	}
	
	function previousArticle(){
		index--;
		if(index <= 0) {
			index = (articles.length - 1);
		}
		displayArticle(index);		
	}
	
	function echonestSearch(artist, articleRange){
		// Resets the data from the last search.
		articles = [];
		// Builds the artist search url and the news search url.
		var searchArtistURL = ECHONEST_GET_ARTIST_URL + "&name=" + artist;
		var searchNewsURL = ECHONEST_GET_ARTIST_NEWS_URL + "&name=" + artist + "&results=" + articleRange + "&start=0";
		
		$.getJSON(searchArtistURL).done(function(data){echonestArtistSearchJSONLoaded(data);});
		$.getJSON(searchNewsURL).done(function(data){
			echonestNewsSearchJSONLoaded(data);
			buildArticleArray();
			displayArticle(index);
		});

	}

	function echonestArtistSearchJSONLoaded(obj) {
		if(obj.response.artists == undefined) {
			document.querySelector("#news").innerHTML = "<p>No Artist Found</b>";
			$("#news").fadeIn(1000);
		} else if(obj.response.artists.length > 0) {
			var allArtists = obj.response.artists;
			artist = allArtists[0].name;
		}
	}
	
	function echonestNewsSearchJSONLoaded(obj) {
		if(obj.response.news == undefined) {
			document.querySelector("#news").innerHTML = "<p>No News Found</b>";
			$("#news").fadeIn(1000);
		} else if(obj.response.news.length > 0) {
			news = obj.response.news;
		}
	}
	
	function displayArticle() {
		// Populates the news section with one of the articles.
		document.querySelector("#news").innerHTML = articles[index];
		$("#news").fadeIn(1000);
	}
	
	// Builds the news div line by line based on the data in the news array.
	function buildArticleArray() {
		if(news.length > 0) {
			// Build an article entry for each news item found.
			for (var i=0; i < news.length; i++){
				var article = "";
				
				var title = news[i].name;
				var date = news[i].date_found;
				var summary = news[i].summary;
				var url = news[i].url;
				
				article += "<article>";
				article +=  "<h3>";
				article += title;
				article += "</h3>";
				article += "<strong>";
				article += date;
				article += "</strong>";
				article += "<p>";
				article += summary;
				article +=  "</p>";
				article += "<a href=" + url + " target='_blank'>" + url + "</a>";
				article += "</article>";
				
				// Store the article entry that was just made into the array of articles.
				articles[i] = article;
			}
			
			// When the article array has been built, clear the news array so future searches aren't affected.
			news = [];
		} else {
			// Clear the array from any previous searches.
			while(articles.length > 0) {
				articles.pop();
			}
			
			// Reset the index because there are no longer any articles.
			index = 0;
			
			// Let the user know there are no articles for the artist.
			var article = "";
			article += "<p>";
			article += "No news found for searched artist.";
			article += "</p>";
			
			// Store the article entry that was just made into the array of articles.
			articles[0] = article;
		}
		
		echonestLoaded = true;
	}