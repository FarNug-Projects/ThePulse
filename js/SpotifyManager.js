"use strict";

	var SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search?q=";
	var SPOTIFY_GET_ARTIST_URL = "https://api.spotify.com/v1/artists/";
	var SPOTIFY_GET_ALBUM_URL = "https://api.spotify.com/v1/albums/";
	var searchedArtistSpotifyID;
	var searchedArtistAlbums = [];
	var currentArtistAlbum;
	var currentArtistAlbumIndex = 0;
	var previewAudio;
	var previewAudioPlaying = false;
	var spotifyLoaded = false;
	var spotifyAlbumTimer = 1;
	var spotifyAlbumTimerPaused = false;

	function spotifySearch(artist){
		// build up our artist search URL
		var searchArtistURL = SPOTIFY_SEARCH_URL + artist + "&type=artist";
		
		searchedArtistAlbums = [];
		currentArtistAlbum = undefined;
		if(previewAudio) {
			previewAudio.pause();
		}
		previewAudio = undefined;
		previewAudioPlaying = false;
		
		$.getJSON(searchArtistURL).done(function(data){spotifyArtistSearchJSONLoaded(data);});
		
	}

	//search for the most popular artist
	function spotifyArtistSearchJSONLoaded(obj){
		if(obj.error){
			document.querySelector("#content").innerHTML = "<b>No Results Found</b>";
		} else {
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
		if(obj.error){
			document.querySelector("#content").innerHTML = "<b>No Results Found</b>";
		} else {
			var results = obj.items;
			var allAlbums = [];
			
			var album;
			var albumIndex
			var previousAlbum;
			var previousAlbumIndex;
			
			
			for(var i = 0; i < results.length; i++)
			{
				albumIndex = i;
				album = results[albumIndex];
				
				if(albumIndex > 0){
					previousAlbumIndex = i - 1;
					previousAlbum = results[previousAlbumIndex];
					if(album.name != previousAlbum.name){
						allAlbums.push(album);
					}
				}
				else{
					allAlbums.push(album);
				}
			}
			
			for(var i = 0; i < allAlbums.length; i++)
			{
				var album = allAlbums[i]
				var getAlbumURL = SPOTIFY_GET_ALBUM_URL + album.id;
				$.getJSON(getAlbumURL).done(function(data){
					spotifyAlbumGetJSONLoaded(data);
					buildAlbumContainer()
				;});
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
		
		//current album
		var line = "<div class = " + "album " +"onClick= spotifyAlbumPreview()>";
					line += "<img src='" + currentArtistAlbum.imageURL + "' />";
					if(!previewAudioPlaying)
					{
						line += "<div class=" + "album-info" + ">";
						line +=  "<p class =" + "album-preview" + ">";
						line += currentArtistAlbum.title;
						line += "</p>";
						line += "</div>";
					}
					line += "</div>";
					
					html += line;
		
		//all albums
		/*for (var i=0;i<searchedArtistAlbums.length;i++){
				var album = searchedArtistAlbums[i];
				var name = album.name;
				var id = album.id;
				var imageURL = album.images[1].url;
				//var previewTrack = album.tracks.items.preview_url;
				
				var previousAlbum;
				var previousName;
				
				if(i > 0)
				{
					previousAlbum = searchedArtistAlbums[i-1];
					previousName = previousAlbum.name;
				}
				
				if(name != previousName)
				{
					var line = "<div class = " + "album " +"onClick=" + "spotifyGetPreview()" + ">";
					line += "<img src='" + imageURL + "' />";
					line += "<div class=" + "album-info" + ">";
					line +=  "<p class =" + "album-preview" + ">";
					line += "Click to preview";
					line += "</p>";
					line += "</div>";
					line += "</div>";
					
					bigString += line;
				}
			}*/
			document.querySelector("#content").innerHTML = html;
			//document.querySelector("#loading").innerHTML = "";
			
			$("#album").fadeIn(1000);
	}
	
	//update the album container and rebuild
	function updateAlbumContainer(){
		$("#album").fadeOut(250);
		currentArtistAlbumIndex++;
		currentArtistAlbumIndex = currentArtistAlbumIndex % searchedArtistAlbums.length;
		console.log(currentArtistAlbumIndex);
		buildAlbumContainer();
	}