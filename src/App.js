import { Fragment, useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "4b81001";
export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectedMovie(id) {
    if (id === selectedId) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
    }
  }

  function handleRemoveMovie(id) {
    const modifiedWatchedList = watched.filter((movie) => movie.imdbID !== id);
    setWatched(modifiedWatchedList);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");
          const data = await res.json();
          if (data.Resp === "False") throw new Error("Movie not Found");
          setMovies(data.Search);
        } catch (err) {
          if (error.name !== "AbortError") setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      if (!query.length) {
        setMovies([]);
        setError("");
        return;
      }
      handleCloseMovie();
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList
              handleSelectedMovie={handleSelectedMovie}
              movies={movies}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              handleCloseMovie={handleCloseMovie}
              selectedId={selectedId}
              handleAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <Fragment>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                handleRemoveMovie={handleRemoveMovie}
              />
            </Fragment>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies && movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function MovieList({ movies, handleSelectedMovie }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie
          handleSelectedMovie={handleSelectedMovie}
          movie={movie}
          key={movie.imdbID}
        ></Movie>
      ))}
    </ul>
  );
}

function Movie({ movie, handleSelectedMovie }) {
  return (
    <li onClick={() => handleSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieDetails({
  watched,
  selectedId,
  handleCloseMovie,
  handleAddWatched,
  setPageTitle,
}) {
  const [selectedMovie, setSelectedMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const isWatched = watched.map((movie) => movie.imdbID)?.includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  useEffect(
    function () {
      if (selectedMovie) document.title = `Movie | ${selectedMovie.Title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [selectedMovie]
  );

  function handleUserRating(rating) {
    setUserRating(rating);
  }

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title: selectedMovie.Title,
      poster: selectedMovie.Poster,
      imdbRating: Number(selectedMovie.imdbRating),
      runtime: Number(selectedMovie.Runtime.split(" ").at(0)),
      userRating,
    };
    handleAddWatched(newWatchedMovie);
    handleCloseMovie();
  }

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") handleCloseMovie();
      }
      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [handleCloseMovie]
  );

  useEffect(
    function () {
      async function fetchMovies() {
        setIsLoading(true);
        const res = await fetch(
          ` http://www.omdbapi.com/?i=${selectedId}&apikey=4b81001`
        );

        if (!res.ok)
          throw new Error("Something wrong with finding the movie detail");
        const data = await res.json();
        if (data.Response === "False") throw new Error("can't find the movie");
        setIsLoading(false);
        setSelectedMovie(data);
      }
      if (!selectedId) return;
      fetchMovies();
    },
    [selectedId]
  );

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="details">
          <header>
            <button className="btn-back" onClick={handleCloseMovie}>
              ←
            </button>
            <img
              src={selectedMovie.Poster}
              alt={`Poster of ${selectedMovie.Title}`}
            />
            <div className="details-overview">
              <h2>{selectedMovie.Title}</h2>
              <p>
                <span>{selectedMovie.Released}</span>
                <span>&bull;</span>
                <span>{selectedMovie.Runtime}</span>
              </p>
              <p>{selectedMovie.Genre}</p>
              <p>
                <span>⭐</span> {selectedMovie.imdbRating} IMDB Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {isWatched ? (
                <p>You have rated this movie {watchedUserRating}⭐️ </p>
              ) : (
                <StarRating
                  handleUserRating={handleUserRating}
                  maxRating={10}
                  size="24"
                />
              )}
              {userRating > 0 && (
                <button className="btn-add" onClick={handleAdd}>
                  + Add to list
                </button>
              )}
            </div>
            <p>
              <em>{selectedMovie.Plot}</em>
            </p>
            <p>Starring {selectedMovie.Actors}</p>
            <p>Directed by {selectedMovie.Director}</p>
          </section>
        </div>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(
    watched.map((movie) => movie.imdbRating)
  ).toFixed(1);
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime)).toFixed(1);
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, handleRemoveMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          key={movie.imdbRating}
          handleRemoveMovie={handleRemoveMovie}
          movie={movie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ handleRemoveMovie, movie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleRemoveMovie(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
