<script>
import _ from 'lodash';
import {getDateKey, getDateMonthKey} from "../utils.js";

export default {
  name: "Calendar",

  props: [ 'cids', 'viewDate' ],

  data() {
    let vd = _.isDate( this.viewDate ) ? this.viewDate : new Date();

    return {
      myYearStep: 50,
      myViewDate: vd,
      myViewYear: vd.getFullYear(),
      myViewMonth: vd.getMonth(),
      viewMode: 'days',
    };
  },

  computed: {
    enumYears() {
      let today = new Date();
      let todayYear = today.getFullYear();
      let yearStep = this.myYearStep;
      let fromYear = Math.floor( this.myViewYear / yearStep ) * yearStep;
      let res = [];
      let cids = this.cids;

      for( var i = 0; i < yearStep; i++ ) {
        let theYear = fromYear + i;
        let now = new Date( theYear, 0, 1 );
        let stats;

        if( cids ) {
          let dataKeyPrefix = theYear + '-';
          let sum = 0, count = 0;

          for( let dataKey in localStorage ) {
            if( !localStorage.hasOwnProperty( dataKey ) ) {
              continue;
            }

            if( !dataKey.startsWith( dataKeyPrefix ) ) {
              continue;
            }

            let data = JSON.parse( localStorage.getItem( dataKey ) );

            if( data ) {
              _.map( cids, ( cid ) => {
                let val = parseInt( data[cid] );
                if( !isNaN( val ) ) {
                  sum += val;
                  count++;
                }
              });

            }
          }

          if( count > 0 ) {
            stats = {
              sum: sum,
              count: count,
              avg: Math.round( 100 * sum / count ) / 100,
            };
          }
        }

        if( !stats ) {
          continue;
        }

        var year = {
          date: now,
          title: theYear,
          class: ['opt', 'year'],
          stats: stats,
        };

        if( theYear === todayYear ) {
          year.class.push( 'now' );
        }

        res.push(year);
      }

      return res;
    },

    enumMonths() {
      var today = new Date();
      var months = this.allMon;
      let res = [];
      let cids = this.cids;

      for( var i = 0; i < 12; i++) {
        let now = new Date(this.myViewYear, i, 1);
        let stats;

        if( cids ) {
          let monKey = getDateMonthKey( now );
          let dataKeyPrefix = monKey + '-';
          let sum = 0, count = 0;

          for( let dataKey in localStorage ) {
            if( !localStorage.hasOwnProperty( dataKey ) ) {
              continue;
            }

            if( !dataKey.startsWith( dataKeyPrefix ) ) {
              continue;
            }

            let data = JSON.parse( localStorage.getItem( dataKey ) );

            if( data ) {
              _.map( cids, ( cid ) => {
                let val = parseInt( data[cid] );
                if( !isNaN( val ) ) {
                  sum += val;
                  count++;
                }
              });

            }
          }

          if( count > 0 ) {
            stats = {
              sum: sum,
              count: count,
              avg: Math.round( 100 * sum / count ) / 100,
            };
          }
        }

        if( !stats ) {
          continue;
        }

        var mon = {
          date: now,
          title: months[i],
          class: ['opt', 'mon'],
          stats: stats,
        };

        if( mon.date.getFullYear() === today.getFullYear() && mon.date.getMonth() === today.getMonth() ) {
          mon.class.push('now');
        }

        res.push(mon);
      }

      return res;
    },

    enumDays() {
      var today = new Date();
      let year = this.myViewYear, mon = this.myViewMonth;
      let endDate = new Date(year, mon + 1, 0);
      let cids = this.cids;

      var res = [];

      for( let d = 1, lastDate = endDate.getDate(); d <= lastDate; d++ ) {
        let now = new Date(year, mon, d);
        let stats;

        if( cids ) {
          let dateKey = getDateKey( now );
          let data = JSON.parse( localStorage.getItem( dateKey ) );

          if( data ) {
            let sum = 0, count = 0;

            _.map( cids, ( cid ) => {
              let val = parseInt( data[cid] );
              if( !isNaN( val ) ) {
                sum += val;
                count++;
              }
            });

            if( count > 0 ) {
              stats = {
                sum: sum,
                count: count,
                avg: Math.round( 100 * sum / count ) / 100,
              };
            }
          }
        }

        if( !stats ) {
          continue;
        }

        let day = {
          date: now,
          title: d,
          class: ['opt', 'day'],
          stats: stats,
        };

        if( now.getFullYear() === today.getFullYear() && now.getMonth() === today.getMonth() && now.getDate() === today.getDate() ) {
          day.class.push('now');
        }

        res.push( day );
      }

      return res;
    },

    viewTitle() {
      if( this.viewMode === 'days' ) {
        var m = this.allMonths[this.myViewMonth];
        var y = this.myViewYear;

        return m + ' ' + y;
      }

      if( this.viewMode === 'months' ) {
        return this.myViewYear;
      }

      if( this.viewMode === 'years' ) {
        let fromYear = Math.floor(this.myViewYear / this.myYearStep) * this.myYearStep;
        let toYear = fromYear + this.myYearStep - 1;
        return fromYear + ' - ' + toYear;
      }

      return '';
    },

    viewSum() {
      let sum;

      if( this.viewMode === 'days' ) {
        let days = this.enumDays;

        _.map( days, ( x ) => {
          if( x.stats ) {
            if( sum === undefined ) {
              sum = 0;
            }
            sum += x.stats.sum;
          }
        });
      }

      return sum;
    },
    viewStats() {
      let sum = 0, count = 0, items;

      if( this.viewMode === 'days' ) {
        items = this.enumDays;
      } else if( this.viewMode === 'months' ) {
        items = this.enumMonths;
      } else if( this.viewMode === 'years' ) {
        items = this.enumYears;
      }

      if( items ) {
        _.map( items, ( x ) => {
          if( x.stats ) {
            sum += x.stats.sum;
            count += x.stats.count;
          }
        });
      }

      if( count > 0 ) {
        return {
          sum: sum,
          count: count,
          avg: Math.round( 100 * sum / count ) / 100,
        };
      }
    },

    allMonths() {
      return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    },

    allMon() {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    },

    enumDows() {
      return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    },

    minDate() {
      if( _.isDate( this.start_date ) ) {
        return this.start_date;
      } else if( _.isString( this.start_date ) && this.start_date.match(/^\d+-\d+-\d+$/) ) {
        return new Date( this.start_date );
      }

      return null;
    },

    maxDate() {
      if( _.isDate( this.end_date ) ) {
        return this.end_date;
      } else if( _.isString( this.end_date ) && this.end_date.match(/^\d+-\d+-\d+$/) ) {
        return new Date( this.end_date );
      }

      return null;
    },
  },

  methods: {
    prevScreen() {
      var prev = null;

      if( this.viewMode === 'days' ) {
        prev = new Date(this.myViewYear, this.myViewMonth - 1, 1);
      } else if( this.viewMode === 'months' ) {
        prev = new Date(this.myViewYear - 1, 0, 1);
      } else if( this.viewMode === 'years' ) {
        this.myViewYear = (Math.floor( this.myViewYear / this.myYearStep ) - 1) * this.myYearStep;
        return;
      }

      if( prev ) {
        this.myViewYear  = prev.getFullYear();
        this.myViewMonth = prev.getMonth();
      }
    },

    nextScreen() {
      var prev = null;

      if( this.viewMode === 'days' ) {
        prev = new Date(this.myViewYear, this.myViewMonth + 1, 1);
      } else if( this.viewMode === 'months' ) {
        prev = new Date(this.myViewYear + 1, 0, 1);
      } else if( this.viewMode === 'years' ) {
        this.myViewYear = (Math.floor( this.myViewYear / this.myYearStep ) + 1) * this.myYearStep;
        return;
      }

      if( prev ) {
        this.myViewYear  = prev.getFullYear();
        this.myViewMonth = prev.getMonth();
      }
    },

    toggleViewMode() {
      if( this.viewMode === 'days' ) {
        this.viewMode = 'months';
      } else if( this.viewMode === 'months' ) {
        this.viewMode = 'years';
      }
    },

    toggleLayoutMode() {
      if( this.layoutMode === 'list' ) {
        this.layoutMode = 'grid';
      } else {
        this.layoutMode = 'list';
      }
    },

    setMonth( date ) {
      this.viewMode = 'days';

      if( this.myViewYear === date.getFullYear() && this.myViewMonth === date.getMonth() ) {
        return;
      }

      this.myViewYear = date.getFullYear();
      this.myViewMonth = date.getMonth();
    },

    setYear( date ) {
      this.viewMode = 'months';

      if( this.myViewYear === date.getFullYear() ) {
        return;
      }

      this.myViewYear = date.getFullYear();
      this.myViewMonth = 0;
    },
  },
}
</script>

<template>
  <div class="ct-calendar h100 fl-col">
    <div class="ct-calendar-header ct-shadow-down">
      <div class="fl-row fl-gap-1 fl-al-center fl-between">
        <div class="ct-calendar-title fl-grow" @click.prevent="toggleViewMode()">
          {{ viewTitle }}
        </div>
        <div class="x-gap-1">
          <a href="#" class="ct-btn-tool" @click.prevent="prevScreen()"><i class="fa-solid fa-chevron-left"></i></a>
          <a href="#" class="ct-btn-tool" @click.prevent="nextScreen()"><i class="fa-solid fa-chevron-right"></i></a>
        </div>
      </div>
    </div>

    <div class="fl-grow-scroll-y">
      <ul v-if="viewMode === 'days'" class="ct-calendar-days">
        <li v-if="enumDays.length === 0" class="ct-disabled">No data</li>
        <li v-for="day in enumDays" :class="day.class">
          <div class="fl-row fl-gap-1 fl-between fl-al-center">
            <div class="title">{{ day.title }}</div>
            <div v-if="day.stats" class="ct-enum" >
              <span>{{ day.stats.sum }}</span>
              <span v-if="day.stats.count > 1">{{ day.stats.avg }}</span>
            </div>
          </div>
        </li>
      </ul>

      <ul v-if="viewMode === 'months'" class="ct-calendar-months">
        <li v-if="enumMonths.length === 0" class="ct-disabled">No data</li>
        <li v-for="mon in enumMonths" :class="mon.class" @click.prevent="setMonth(mon.date)">
          <div class="fl-row fl-gap-1 fl-between fl-al-center">
            <div class="title">{{ mon.title }}</div>
            <div v-if="mon.stats" class="ct-enum" >
              <span>{{ mon.stats.sum }}</span>
              <span v-if="mon.stats.count > 1">{{ mon.stats.avg }}</span>
            </div>
          </div>
        </li>
      </ul>

      <ul v-if="viewMode === 'years'" class="ct-calendar-years">
        <li v-if="enumYears.length === 0" class="ct-disabled">No data</li>
        <li v-for="year in enumYears" :class="year.class" @click.prevent="setYear( year.date )">
          <div class="fl-row fl-gap-1 fl-between fl-al-center">
            <div class="title">{{ year.title }}</div>
            <div v-if="year.stats" class="ct-enum" >
              <span>{{ year.stats.sum }}</span>
              <span v-if="year.stats.count > 1">{{ year.stats.avg }}</span>
            </div>
          </div>
        </li>
      </ul>

    </div>

    <div class="ct-calendar-footer ct-shadow-up" style="text-align: right">
      <span v-if="viewStats" class="ct-enum">
        <span>{{ viewStats.sum }}</span>
        <span>{{ viewStats.avg }}</span>
      </span>
      <span v-else class="ct-disabled">N/A</span>
    </div>
  </div>
</template>

<style scoped>
.ct-calendar-header,
.ct-calendar-footer {
  padding: 10px;
}

.ct-calendar-title {
  font-size: 24px;
  font-weight: 300;
  color: #417792;
}

.ct-calendar ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.ct-calendar ul>li {
  padding: 10px;
  border-bottom: 1px solid #DDD;
}
.ct-calendar ul>li .title {
  font-size: 24px;
  font-weight: 300;
  color: #FF4848;
}
</style>