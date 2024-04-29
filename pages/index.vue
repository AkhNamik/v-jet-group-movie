<template>
  <div class='home'>
    <!-- Hero -->
    <Hero />

    <!-- Search -->
    <div class='container search'>
      <input
        type='text'
        placeholder='Search'
        @input='searchMovies($event.target.value)'
        v-model='searchField'
      />
      <button v-show="searchField !== ''" @click='clearSearch' class='button'>
        Clear Search>>>>???
      </button>
      <select v-model='selectedGenre' @input='searchGenre'>
        <option disabled value=''>Choose genre</option>
        <option v-for='option in options' v-bind:value='option.value'>
          {{ option.text }}
        </option>
      </select>
    </div>

    <!-- Loading Animation -->
    <Loading v-if='$fetchState.pending' />

    <div class='container' v-if='!searchedMovies.length && searchField'>
      <div style='height: 400px; padding: 50px'>
        <h1 style='text-align: center; color: #c9c9c9'>Sorry, nothing found=(</h1>
      </div>
    </div>

    <!-- Movies -->
    <div v-else class='container movies'>
      <!-- Search Results -->
      <div id='movie-grid' v-if="searchField !== '' || selectedGenre" class='movies-grid'>
        <div
          class='movie'
          v-for='(movie, index) in searchedMovies'
          :key='index'
        >
          <div class='movie-img'>
            <img
              :src='movie.image'
              alt='image movie'
            />
            <p class='overview' v-html='movie.description'></p>
          </div>
          <div class='info'>
            <p class='title'>
              {{ movie.name.slice(0, 25)
              }}<span v-if='movie.name.length > 25'>...</span>
            </p>
            <NuxtLink
              class='button button-light'
              :to="{path: '/movies', query: { movie_id: movie.id }}"
            >
              Get More Info
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Now Streaming  -->
      <div id='movie-grid' v-else class='movies-grid'>
        <div class='movie' v-for='(movie, index) in movies' :key='index'>
          <div class='movie-img'>
            <img
              :src='movie.image'
              alt='image movie'
            />
            <p class='overview' v-html='movie.description'></p>
          </div>
          <div class='info'>
            <p class='title'>
              {{ movie.name.slice(0, 25) }}
              <span v-if='movie.name.length > 25'>...</span>
            </p>
            <NuxtLink
              class='button button-light'
              :to="{ path: '/movies', query: { movie_id: movie.id }}"
            >
              Get More Info
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash.debounce'
export default {
  name: 'home',
  data: () => ({
    movies: [],
    searchedMovies: [],
    searchField: '',
    selectedGenre: null,
    options: [
      { text: 'Action', value: 0 },
      { text: 'Adventures', value: 1 },
      { text: 'Comedy', value: 2 },
      { text: 'Drama', value: 3 },
      { text: 'Horror', value: 4 },
      { text: 'Westerns', value: 5 },
      { text: 'All', value: null }
    ]
  }),
  methods: {
    async getMovies() {
      const { data } = await this.$axios.$get('/movies')
      this.movies = data
    },

    searchMovies: debounce(async function(e) {
      const query = new URLSearchParams()
      this.selectedGenre ? query.append('genres', this.selectedGenre) : null
      query.append('name', e)
      const { data } = await this.$axios.$get(`/movies?${query}`)
      this.searchedMovies = data
      this.searchField = e
    },300),
    async searchGenre(e) {
      const query = new URLSearchParams()
      this.searchField.length ? query.append('name', this.searchField) : null
      query.append('genres', e.target.value)
      const { data } = await this.$axios.$get(`/movies?${query}`)
      this.searchedMovies = data
    },

    clearSearch() {
      this.searchField = ''
      this.selectedGenre = null
      this.searchedMovies = []
    }
  },

  async fetch() {
    this.searchField === '' ? await this.getMovies() : await this.searchMovies()
  },
  fetchDelay: 1000
}
</script>

<style lang='scss'>
.home {
  .loading {
    padding-top: 120px;
    align-items: flex-start;
  }

  .search {
    display: flex;
    padding: 32px 16px;
    gap: 20px;

    input {
      max-width: 350px;
      width: 100%;
      padding: 12px 6px;
      font-size: 14px;
      border: none;

      &:focus {
        outline: none;
      }
    }

    .button {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }

  .movies {
    padding: 32px 16px;

    .movies-grid {
      display: grid;
      column-gap: 32px;
      row-gap: 64px;
      grid-template-columns: 1fr;
      @media (min-width: 500px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (min-width: 750px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (min-width: 1100px) {
        grid-template-columns: repeat(4, 1fr);
      }

      .movie {
        position: relative;
        display: flex;
        flex-direction: column;

        .movie-img {
          position: relative;
          overflow: hidden;

          &:hover {
            .overview {
              transform: translateY(0);
            }
          }

          img {
            display: block;
            width: 100%;
            height: 100%;
          }

          .review {
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            background-color: #c92502;
            color: #fff;
            border-radius: 0 0 16px 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .overview {
            line-height: 1.5;
            position: absolute;
            bottom: 0;
            background-color: rgba(201, 38, 2, 0.9);
            padding: 12px;
            color: #fff;
            transform: translateY(100%);
            transition: 0.3s ease-in-out all;
          }
        }

        .info {
          margin-top: auto;

          .title {
            margin-top: 8px;
            color: #fff;
            font-size: 20px;
          }

          .release {
            margin-top: 8px;
            color: #c9c9c9;
          }

          .button {
            margin-top: 8px;
          }
        }
      }
    }
  }
}
</style>
