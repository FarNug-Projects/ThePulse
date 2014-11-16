"use strict";

	var SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search?q=";
	var SPOTIFY_GET_ARTIST_URL = "https://api.spotify.com/v1/artists/";
	var SPOTIFY_GET_ALBUM_URL = "https://api.spotify.com/v1/albums/";
	var searchedArtistSpotifyID;
	var searchedArtistAlbums = [];
	var currentArtistAlbum;
	var previewAudio;
	var previewAudioPlaying = false;

	function spotifySearch(artist){
		// build up our artist search URL
		var searchArtistURL = SPOTIFY_SEARCH_URL + artist + "&type=artist";
		
		searchedArtistAlbums = [];
		currentArtistAlbum = undefined;
		previewAudio = undefined;
		previewAudioPlaying = false;
		
		$.getJSON(searchArtistURL).done(function(data){spotifyArtistSearchJSONLoaded(data);});
		
	}

	//search for the most popular artist
	function spotifyArtistSearchJSONLoaded(obj){
		if(obj.error){
			console.log("length=" + obj.results.albummatches.album.length);
			document.querySelector("#content").innerHTML = "<b>No Results Found</b>";
		} else {
			var allArtists = obj.artists.items;
			console.log("allArtists.length = " + allArtists.length);
			
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
			console.log("Artist ID: " + searchedArtistSpotifyID);
			
			
			// search for the specific artist's albums
			var getArtistAlbumURL = SPOTIFY_GET_ARTIST_URL + searchedArtistSpotifyID + "/albums/";
			$.getJSON(getArtistAlbumURL).done(function(data){spotifyArtistAlbumJSONLoaded(data);});
		}
	}

	//search for all the artist's albums and then get in depth data about them
	function spotifyArtistAlbumJSONLoaded(obj){		
		if(obj.error){
			console.log("length=" + obj.results.albummatches.album.length);
			document.querySelector("#content").innerHTML = "<b>No Results Found</b>";
		} else {
			var allAlbums = obj.items;
			console.log("allAlbums.length = " + allAlbums.length);
			
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
		console.log("Title: " + currentArtistAlbum.title);
		console.log("Preview URL: " + currentArtistAlbum.previewURL);
		
		if(previewAudioPlaying == false){
			if (previewAudio) {
                previewAudio.pause();
            }
			previewAudio = new Audio(currentArtistAlbum.previewURL);
			previewAudio.play();
			previewAudio.addEventListener('ended', function(){ 
				previewAudioPlaying = false;
				buildAlbumContainer();
			});
			previewAudioPlaying = true;
			buildAlbumContainer();
		}
		else{
			if(previewAudio){
				previewAudio.pause();
				previewAudioPlaying = false;
				buildAlbumContainer();
			}
		}
	}
	
	function buildAlbumContainer()
	{
		currentArtistAlbum = searchedArtistAlbums[0];
	
		var bigString = "";
		
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
					
					bigString += line;
		
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
			document.querySelector("#content").innerHTML = bigString;
			
			$("#content").fadeIn(1000);
	}