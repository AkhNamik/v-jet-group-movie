<template>
  <!-- Loading -->
  <Loading v-if='$fetchState.pending' />

  <!-- Movie Info -->
  <div v-else class='single-movie container'>
    <NuxtLink class='button' :to="{ name: 'index' }">
      Back???>>>>
    </NuxtLink>
    <div class='movie-info'>
      <div class='movie-img'>
        <img
          :src='movie.image'
          alt='movie image'
        />
      </div>
      <div class='movie-content'>
        <h1>{{ movie.name }}</h1>
        <p class='movie-fact' v-html='movie.description ' />
        <div class='movie-fact' v-html='movie.additional' />
      </div>
    </div>
    <div class='movie-content'>
      <h1>Sessions:</h1>
      <ul style='list-style: none'>
        <li style='line-height: 40px' v-for='(session, index) in sessionsDate' :key='index'>
          {{ session.showdate }}
          <div class='date-content'>
            <span
              class='time'
              v-for='time in parseSessionTime(session.daytime)'
              @click='getPlaces(time, session.showdate)'
            >
            {{ time }}
            </span>
          </div>
        </li>
      </ul>
    </div>
    <modal
      name='modal-sessions'
      :height='"auto"'
      :width='"80%"'
      :scrollable='true'
      :adaptive='true'
    >
      <div class='session-header'>
        <h1>Screen</h1>
      </div>
      <div class='session-places'>
        <ul v-for='item in sessionPlaces'>
          <li v-for='place in item.places'>
            <div v-if='place.is_free'>
              <div v-if='place.isSelected' class='icon-place-active'>
                <span>{{ place.seat }}</span>
              </div>
              <div v-else class='icon-place' @click='choosePlace(place,item.row)' />
            </div>
            <div class='place-closed' v-else>

            </div>
          </li>
        </ul>
      </div>
      <modal
        name='modal-confirm'
        :height='"auto"'
        :clickToClose='false'
        :scrollable='true'
        :adaptive='true'
      >
        <div class='session-header' style='padding: 10px'>
          <h1 style='border: none;'>Are you sure you want to confirm your ticket purchase?</h1>
        </div>
        <div class='modal-actions'>
          <button @click='sendToBookTicket'>Confirm</button>
          <button @click='cancelSelectedSeat'>Cancel</button>
        </div>
      </modal>
      <modal
        name='modal-success'
        :height='"auto"'
        :scrollable='true'
        :adaptive='true'
        @closed='$modal.hide("modal-sessions")'
      >
        <div class='session-header'>
          <h1>Ticket booked successfully!</h1>
        </div>
      </modal>
      <modal
        name='modal-error'
        :height='"auto"'
        :scrollable='true'
        :adaptive='true'
      >
        <div class='session-header'>
          <h1>An error has occurred, please try again</h1>
        </div>
      </modal>
    </modal>
  </div>
</template>

<script>
export default {
  name: 'movie-detail',
  data() {
    return {
      movie: '',
      sessionsDate: [],
      sessionPlaces: [],
      selectedPlace: null
    }
  },
  watch: {
    '$route.query': '$fetch'
  },
  methods: {
    async getSingleMovie() {
      const { data } = await this.$axios.$get(`/movies?movie_id=${this.$route.query.movie_id}`)
      this.movie = data[0] //Would remake the answer on the back
    },
    async getSessionsMovies() {
      const { data } = await this.$axios.$get(`/movieShows?movie_id=${this.$route.query.movie_id}`)
      if (!data.hasOwnProperty(`${this.$route.query.movie_id}`)) return
      this.sessionsDate = data[`${this.$route.query.movie_id}`]
    },
    parseSessionTime(str) {
      return str.split(';')
    },
    async getPlaces(date_time, date) {
      this.clearSessionPlaces()
      const query = this.appendQueryParams(date_time, date)
      const places = await this.$axios.$get(`/showPlaces?${query}`)
      this.$modal.show('modal-sessions')
      this.sessionPlaces = this.parsePlacesData(places)
      this.selectedPlace = {
        movie_id: +this.$route.query.movie_id,
        showdate: date,
        daytime: date_time
      }
    },
    parsePlacesData(places) {
      const readableArray = []
      for (let key of places.data) {
        const obj = {}
        key.forEach((item, i) => {
          if (item.row) obj[Object.keys(item)] = item.row
          obj['places'] = item
        })
        readableArray.push({ ...obj })
      }
      return readableArray
    },
    choosePlace(place, row) {
      if (!place) return
      this.sessionPlaces = this.sessionPlaces.map(session => {
        const find = session.places.find(item => item === place)
        if (find) find.isSelected = true
        session.places.forEach(item => item !== place ? item.isSelected = false : null)
        return session
      })
      this.selectedPlace = {
        ...this.selectedPlace,
        row,
        seat: place.seat
      }
      this.$modal.show('modal-confirm')
    },
    async sendToBookTicket() {
      this.$modal.hide('modal-confirm')
      const data = { ...this.selectedPlace }
      const resp = await this.$axios.$post(`/bookPlace`, data)
      if (resp.error_code) {
        this.$modal.show('modal-error')
        return
      }
      await this.$modal.show('modal-success')
    },
    cancelSelectedSeat() {
      this.sessionPlaces = this.sessionPlaces.map(session => {
        session.places.forEach(item => item.isSelected ? item.isSelected = false : null)
        return session
      })
      this.$modal.hide('modal-confirm')
    },
    appendQueryParams(date_time, date) {
      const query = new URLSearchParams()
      query.append('daytime', date_time)
      query.append('showdate', date)
      query.append('movie_id', this.$route.query.movie_id)
      return query
    },
    clearSessionPlaces() {
      this.sessionPlaces = []
    }
  },

  async fetch() {
    await this.getSingleMovie()
    await this.getSessionsMovies()
  },

  // delay for fetching
  fetchDelay: 1000
}
</script>

<style lang='scss'>
.single-movie {
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 32px 16px;

  .button {
    align-self: flex-start;
    margin-bottom: 32px;
  }

  .movie-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    color: #fff;
    @media (min-width: 800px) {
      flex-direction: row;
      align-items: flex-start;
    }

    .movie-img {
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;

        @media (min-width: 800px) {
          max-height: 700px;
          width: initial;
        }
      }
    }

    .movie-content {
      h1 {
        font-size: 56px;
        font-weight: 400;
      }

      .movie-fact {
        margin-top: 12px;
        font-size: 20px;
        line-height: 1.5;
        padding: 10px 0;

        span {
          font-weight: 600;
          text-decoration: underline;
        }
      }
    }
  }

  .date-content {
    display: flex;
    gap: 20px;

    .time {
      padding: 0px 20px;
      border: 1px solid #fff;
      color: #fff;
      border-radius: 10px;
      cursor: pointer;
    }

    .time:hover {
      border: 1px solid #7CFC00;
      color: #7CFC00;
      transition: all .3s ease-in-out;
    }
  }

  .session-places {
    display: grid;
    column-gap: 5px;
    row-gap: 10px;
    grid-template-columns: auto;
    padding: 20px;
    justify-items: center;

    ul {
      display: flex;
      list-style: none;
    }

    ul > li {
      color: #000;
    }

    .icon-place {
      width: 14px;
      height: 20px;
      margin: 0 2px;
      background-color: #3cb4e7;
      cursor: pointer;
      border-radius: 10px;
    }

    .icon-place:hover {
      background-color: #7CFC00;
    }

    .icon-place-active {
      background-color: #7CFC00;
      width: 14px;
      height: 20px;
      margin: 0 2px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      text-align: center;
      align-items: center;
      color: #000;
      font-size: 10px;
      font-weight: bold;
      border-radius: 10px;
    }
  }

  .place-closed {
    background-color: #c92502;
    width: 14px;
    height: 20px;
    margin: 0 2px;
    cursor: not-allowed;
    border-radius: 10px;
  }

  .session-header {
    display: flex;
    justify-content: center;
    padding: 10px 0;

    h1 {
      color: #000;
    }
  }

  .selected-place {
    padding: 20px;
  }

  .modal-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;

    button {
      padding: 10px;
      border: 1px solid #c92502;
      cursor: pointer;
      color: #211f1f;
    }

    button:hover {
      background: #c92502;
      color: #c9c9c9;
      transition: all .4s ease-in-out;
    }
  }
}
</style>
