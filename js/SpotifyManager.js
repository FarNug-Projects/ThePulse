"use strict";

	var SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search?q=";
	var SPOTIFY_GET_ARTIST_URL = "https://api.spotify.com/v1/artists/";
	var SPOTIFY_GET_ALBUM_URL = "https://api.spotify.com/v1/albums/";
	var searchedArtistSpotifyName;
	var searchedArtistSpotifyID;
	var searchedArtistAlbums = [];
	var currentArtistAlbum;
	var currentArtistAlbumIndex = 0;
	var previewAudio;
	var previewAudioPlaying = false;
	var spotifyLoaded = false;
	var spotifyAlbumTimer = 1;
	var spotifyAlbumTimerPaused = false;
	var spotifySuccessfulSearch = false;
	var missingAlbumImage = "images/missing_album.png";
	var albumFound = false;

	function spotifySearch(artist){
		$("#content").fadeOut(250);
	
		// build up our artist search URL
		var searchArtistURL = SPOTIFY_SEARCH_URL + artist + "&type=artist";
		console.log(searchArtistURL);
		
		searchedArtistAlbums = [];
		currentArtistAlbum = undefined;
		currentArtistAlbumIndex = 0;
		if(previewAudio) {
			previewAudio.pause();
		}
		previewAudio = undefined;
		previewAudioPlaying = false;
		
		$.getJSON(searchArtistURL).done(function(data){spotifyArtistSearchJSONLoaded(data);});
		
	}

	//search for the most popular artist
	function spotifyArtistSearchJSONLoaded(obj){
		if(obj.artists.items.length == 0){
			var album = {
				title: "No Album Found for " + searchedArtistSpotifyName,
				imageURL: missingAlbumImage,
			}
				
			searchedArtistAlbums.push(album);
			albumFound = false;
			buildAlbumContainer();
		} 
		else if(obj.artists.items.length == 1){
			var allArtists = obj.artists.items;
			var artist = allArtists[0];
			searchedArtistSpotifyID = artist.id;
			searchedArtistSpotifyID = searchedArtistSpotifyID.trim();
			
			// search for the specific artist's albums
			var getArtistAlbumURL = SPOTIFY_GET_ARTIST_URL + searchedArtistSpotifyID + "/albums/";
			$.getJSON(getArtistAlbumURL).done(function(data){spotifyArtistAlbumJSONLoaded(data);});
		}
		else {
			var allArtists = obj.artists.items;
			
			//search for the most popular artist
			var mostPopularArtist = undefined;
			var mostPopularArtistPopularity = 0;
			var mostPopularArtistID = undefined;
			
			for (var i=0;i<allArtists.length;i++){
				var artist = allArtists[i];
				var id = artist.id;
				var popularity = artist.popularity;
				
				//if the artist has the most popularity, make them the most popular artist
				if( popularity > mostPopularArtistPopularity)
				{
					mostPopularArtist = artist;
					mostPopularArtistPopularity = popularity;
					mostPopularArtistID = id;
				}
			}
			
			if(mostPopularArtist == undefined){
				mostPopularArtist = allArtists[0];
				mostPopularArtistID = allArtists[0].id;
			}
			
			//set the searched Artist's id to the most popular artist result's
			searchedArtistSpotifyID = mostPopularArtistID;
			searchedArtistSpotifyID = searchedArtistSpotifyID.trim();
			
			
			// search for the specific artist's albums
			var getArtistAlbumURL = SPOTIFY_GET_ARTIST_URL + searchedArtistSpotifyID + "/albums/";
			$.getJSON(getArtistAlbumURL).done(function(data){spotifyArtistAlbumJSONLoaded(data);});
		}
	}

	//search for all the artist's albums and then get in depth data about them
	function spotifyArtistAlbumJSONLoaded(obj){		
		if(obj.items.length == 0){
			var album = {
				title: "No Album Found for " + searchedArtistSpotifyName,
				imageURL: missingAlbumImage,
			}
			
			albumFound = false;
			searchedArtistAlbums.push(album);
			buildAlbumContainer();
		} else {
			var results = obj.items;
			var allAlbums = [];
			
			var album;
			var albumIndex
			var previousAlbum;
			var previousAlbumIndex;
			
			//check if there is at least 2 albums
			if(results.length > 1){
				for(var i = 0; i < results.length; i++)
				{
					albumIndex = i;
					album = results[albumIndex];
					
					//check for duplicates
					if(albumIndex > 0){
						albumFound = true;
						previousAlbumIndex = i - 1;
						previousAlbum = results[previousAlbumIndex];
						if(album.name != previousAlbum.name){
							allAlbums.push(album);
						}
					}
					else{
						albumFound = true;
						allAlbums.push(album);
					}
				}
			}
			//push a single album
			else{
				albumFound = true;
				album = results[0];
				allAlbums.push(album);
			}
			
			if(albumFound){
				for(var i = 0; i < allAlbums.length; i++)
				{
					var album = allAlbums[i]
					var getAlbumURL = SPOTIFY_GET_ALBUM_URL + album.id;
					$.getJSON(getAlbumURL).done(function(data){
						spotifyAlbumGetJSONLoaded(data);
						buildAlbumContainer()
					;});
				}
			}
			else{
				var album = {
					title: "No Album Found for " + searchedArtistSpotifyName,
					imageURL: missingAlbumImage,
				}
					
				allAlbums.push(album);
			}
			
			//searchedArtistAlbums = allAlbums;
		}
	}
	
	//add the album information to an array
	function spotifyAlbumGetJSONLoaded(obj){
		var result = obj;
		var album = {
			title: result.name,
			imageURL: result.images[1].url,
			previewURL: result.tracks.items[0].preview_url
		}
		searchedArtistAlbums.push(album)
	}
	
	//code adapted from http://jsfiddle.net/JMPerez/UT7bQ/187/
	function spotifyAlbumPreview(){
		
		console.log("spotifyAlbumPreview was called");
		
		if(previewAudioPlaying == false){
			if (previewAudio) {
                previewAudio.pause();
            }
			previewAudio = new Audio(currentArtistAlbum.previewURL);
			previewAudio.play();
			previewAudio.addEventListener('ended', function(){ 
				previewAudioPlaying = false;
				spotifyAlbumTimerPaused = false;
				buildAlbumContainer();
			});
			previewAudioPlaying = true;
			spotifyAlbumTimerPaused = true; 
			buildAlbumContainer();
		}
		else{
			if(previewAudio){
				previewAudio.pause();
				previewAudioPlaying = false;
				spotifyAlbumTimerPaused = false
				buildAlbumContainer();
			}
		}
	}
	
	//build the album container
	function buildAlbumContainer()
	{
		currentArtistAlbum = searchedArtistAlbums[currentArtistAlbumIndex];
	
		var html = "";
		var line = "";
		
		//current album
		if(albumFound){
			line += "<div class = " + "album" +">";
			line += "<div id = " + "clickable " + "onClick= spotifyAlbumPreview()>";
			line += "<img src='" + currentArtistAlbum.imageURL + "' />";
			line += "</div>";
			if(!previewAudioPlaying)
			{
				line += "<div class=" + "album-info" + ">";
				line +=  "<p class =" + "album-preview" + ">";
				line += currentArtistAlbum.title;
				line += "</p>";
				line += "</div>";
			}
			line += "</div>";
		}
		else{
			line += "<div class = " + "album" + ">";
			line += "<div id = " + "nonclickable"+">";
			line += "<img src='" + currentArtistAlbum.imageURL + "' />";
			line += "</div>";
			line += "<div class=" + "album-info" + ">";
			line +=  "<p class =" + "album-preview" + ">";
			line += currentArtistAlbum.title;
			line += "</p>";
			line += "</div>";
		}
					
		html += line;
		
		document.querySelector("#content").innerHTML = html;
		
		$("#content").fadeIn(1000);
	}
	
	//update the album container and rebuild
	function updateAlbumContainer(){
		$("#content").fadeOut(250);
		if(albumFound){

			currentArtistAlbumIndex++;
			currentArtistAlbumIndex = currentArtistAlbumIndex % searchedArtistAlbums.length;
			console.log(currentArtistAlbumIndex);
			
		}
		buildAlbumContainer();
	}