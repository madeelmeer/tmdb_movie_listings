'use strict';


// Define the variables that we are going to use to see movies list
let movies_list = []
  , genre_list = []
  , arr_genre_show = []
  , genre_cb = []
  , rating = 3
  ;
 
// my api key
const api_key = "42e111f831ea0b955be6377baa104da5";


window.onload = function() {
	
	// get the movies from TMDb
	getAllMovies('popular');
	
	
	// get all Genre
	getAllGenre();
	

};





/*************** Get All Movies (popular) ********************/
const getAllMovies = m_type => {
	
	m_type = m_type?m_type:'popular';
	
	fetch('https://api.themoviedb.org/3/movie/'+m_type+'?api_key='+api_key+'&language=en-UK&page=1')
	  .then(function(response) {
		return response.json();
	  })
	  .then(function(myMovies) {
		  
		  movies_list = myMovies.results; //assign movies to the variable.
		  
		  
	  }).catch(error => console.error('Error:', error));
}




/*************** Get All Genre ********************/
const getAllGenre = () => {
	
	fetch('https://api.themoviedb.org/3/genre/movie/list?api_key='+api_key+'&language=en-UK')
	  .then(function(response) {
		return response.json();
	  })
	  .then(function(allGenre) {
		  genre_list = allGenre.genres; //assign genres to the variable.
		  
		  generateGenreCheckboxes(genre_list);
		  
		  // render movies now
		  renderMovies(movies_list, genre_cb, rating);
	
		  
	  }).catch(error => console.error('Error:', error));
}




/*************** Update rating input value (readonly) ********************/
const updateRatingInput = val => document.getElementById('ratingInput').value=val;



/*************** Genreate checkboxes for all Genres ********************/
const generateGenreCheckboxes = (arr_genre_list) => {
	
	// reset the arr_genre_show
	arr_genre_show = [];
	arr_genre_show.length = 0;
	
	// Get genre ids of current movies
	let currentMoviesGenreIds = movies_list.map((g) => {
		return g.genre_ids;
	});
	

	// Loop through all available genres
	arr_genre_list.forEach(function (genre, index) {
		
		// Loop through the genre ids of each movie
		currentMoviesGenreIds.forEach(function (ids, index) {
			if(ids.includes(genre.id) && !arr_genre_show.includes(genre.id))
			{
				// add value to the array - so we can test that it is not added again
				arr_genre_show.push(genre.id);
				
				
				// call function to add genre to list
				addGenreCheckbox(genre.id, genre.name);
			}
		});
		
		
		
	});
	
}


/*************** Add new Genre checkbox on the page ********************/
const addGenreCheckbox = (id, name) =>
{
	// checkbox template: <div class="checkbox"><label><input type="checkbox" name="genre[]" value="id" /> Title</label></div>
	// parent div id: all_genre
	
	let parent_div = document.getElementById('all_genre');
	parent_div.innerHTML += `<div class="checkbox"><label><input type="checkbox" name="genre[]" value="${id}" /> ${name}</label></div>`;
	
}



/*************** filter the results ********************/
const filterResults = () => {
	// get the rating value
	let rating = document.getElementById('ratingInput').value;
	
	// reset genre filter checbox array
	genre_cb = [];
	genre_cb.length = 0;
	
	// get all genre checkboxes
	let checkboxes = document.getElementsByName('genre[]');
	
	checkboxes.forEach(function (cbox, index) {
		if (cbox.checked) {
			genre_cb.push(Number.parseInt(cbox.value)); // add value to array if checbox is checked.
		}
	});
	
	
	
	// Call the render movies function to display movies after applying the filer
	renderMovies(movies_list, genre_cb, rating);
	
}



/*************** loop through movies ********************/
const renderMovies = (movies_list, genre_cb, rating) =>
{
	let movie_container = document.getElementById('movies')
	, movie_counter = 0;
	movie_container.innerHTML = '';  // reset movies container
	
	
	movies_list.forEach(function (movie, index) {
		
		// check if movide genre_ids contains one of the selected genre
		let have_genre = checkMovieHasGenre(movie.genre_ids, genre_cb);
		
		// check if the rating is greater than or equal to the provided
		if(have_genre && movie.vote_average >= rating) {
			
			showMovie(movie, movie_container);
			movie_counter++;
		}
		
	});
	
	// If there are no movies to show, then display no result found message.
	if(movie_counter==0)
	{
		movie_container.innerHTML = '<p class="col-xs-12 text-danger"><strong>No results found.</p>'; 
	}
}




/*************** Check movie has genre ********************/
const checkMovieHasGenre = (movie_genre, selected_genre) => {
	let found = true;
		
	if(selected_genre.length>0)
	{		
		//found = selected_genre.some(r=> movie_genre.includes(r)); // this will display movies which has at least 1 selected genre
		found = selected_genre.every(r=> movie_genre.includes(r)); // this will display movies which has all selected genre
	}
	
	return found;
}


/*************** show movie on page ********************/
const showMovie = (movie, movie_container) =>
{
	let cur_movie_genre = getMovieGenreNames(movie.genre_ids);
	
	
	movie_container.innerHTML +=`
	<article class="col-xs-12 col-sm-6">
		<div class="card">
			<a title="view details: ${movie.title}" href="https://www.themoviedb.org/movie/${movie.id}" target="_blank"><img src="https://image.tmdb.org/t/p/w185${movie.poster_path}" class="img-responsive primary-img" alt="${movie.title}" /></a>
			<div class="info">
				<h1 class="no-margin">${movie.title}</h1>
				
				<p>Genre: ${cur_movie_genre}</p>
				<p>Rating: ${movie.vote_average}/10</p>
				
				<p class="more">
					<a title="view details: ${movie.title}" href="https://www.themoviedb.org/movie/${movie.id}" target="_blank">More Info</a>
				</p>
			</div>
		</div>
	<article>`;
}




/*************** show movie on page ********************/
const getMovieGenreNames = (ids) =>
{
	let genre_names = '';
	
	ids.forEach(function (id, index) {
		
		const result = genre_list.find( genre => genre.id === id ); // check if genre list have the selected genre id
		
		// check if result has returned an object i.e it is not undefined
		if(typeof(result)==="object")
		{
			genre_names += `${result['name']}, `; // add genre name to the list
		}
		
		
	});
	
	
	genre_names = genre_names.slice(0, -2); // remove last ", "
	
	return genre_names;
}
