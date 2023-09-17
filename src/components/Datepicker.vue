<script>
import _ from 'lodash';

export default {
  name: "Datepicker",
  props: ['modelValue', 'start_date', 'end_date', 'view_date'],
  data() {
    var val = '';

    if( _.isDate(this.modelValue) ) {
      val = this.modelValue;
    } else if( _.isString( this.modelValue ) && this.modelValue.match(/^\d+-\d+-\d+$/) ) {
      val = new Date( this.modelValue );
    }

    var viewDate;

    if( _.isDate(this.view_date) ) {
      viewDate = this.view_date;
    } else if( _.isString( this.view_date) && this.view_date.match(/^\d+-\d+-\d+$/) ) {
      viewDate = new Date(this.view_date);
    } else if( _.isDate( val ) ) {
      viewDate = val;
    } else {
      viewDate = new Date();
    }

    return {
      myValue: val,

      myYear: val && val.getFullYear(),
      myMonth: val && val.getMonth(),
      myDate: val && val.getDate(),

      viewYear: viewDate.getFullYear(),
      viewMonth: viewDate.getMonth(),
      viewDate: viewDate.getDate(),

      viewMode: 'days',
    };
  },

  computed: {
    enumYears() {
      var today = new Date();
      var fromYear = this.viewYear - 1;
      var res = [];

      for( var i = 0; i < 12; i++ ) {
        var theYear = fromYear + i;

        var year = {
          date: new Date(theYear, 0, 1),
          title: theYear,
          class: ['opt', 'year'],
        };

        if( theYear === this.myYear ) {
          year.class.push('selected');
        }

        if( theYear === today.getFullYear() ) {
          year.class.push( 'today' );
        }

        res.push(year);
      }

      return res;
    },

    enumMonths() {
      var today = new Date();
      var months = this.allMon;
      var res = [];

      for( var i = 0; i < 12; i++) {
        var mon = {
          date: new Date(this.viewYear, i, 1),
          title: months[i],
          class: ['opt', 'mon'],
        };

        if( i === this.myMonth && this.viewYear === this.myYear ) {
          mon.class.push('selected');
        }

        if( mon.date.getFullYear() === today.getFullYear() && mon.date.getMonth() === today.getMonth() ) {
          mon.class.push('today');
        }

        res.push(mon);
      }

      return res;
    },

    enumDays() {
      var today = new Date();
      var startDate = new Date(this.viewYear, this.viewMonth, 1);
      startDate.setDate(startDate.getDate() - startDate.getDay());

      var endDate = new Date(this.viewYear, this.viewMonth + 1, 0);

      if( endDate.getDay() !== 6 ) {
        endDate.setDate(endDate.getDate() + 6 - endDate.getDay())
      }

      var res = [];

      while( true ) {
        var now = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

        var day = {
          date: now,
          title: now.getDate(),
          class: ['opt', 'day'],
        };

        if( now.getMonth() < this.viewMonth ) {
          day.class.push('prev');
        } else if( now.getMonth() > this.viewMonth ) {
          day.class.push('next');
        }

        if( now.getFullYear() === this.myYear && now.getMonth() === this.myMonth && now.getDate() === this.myDate ) {
          day.class.push('selected');
        }

        if( !this.isDateEnabled( now ) ) {
          day.class.push('disabled');
        }

        if( now.getFullYear() === today.getFullYear() && now.getMonth() === today.getMonth() && now.getDate() === today.getDate() ) {
          day.class.push('today');
        }

        res.push(day);

        if( now.getFullYear() === endDate.getFullYear() && now.getMonth() === endDate.getMonth() && now.getDate() === endDate.getDate() ) {
          break;
        }

        startDate.setDate(now.getDate() + 1);
      }

      return res;
    },

    viewTitle() {
      if( this.viewMode === 'days' ) {
        var m = this.allMonths[this.viewMonth];
        var y = this.viewYear;

        return m + ' ' + y;
      }

      if( this.viewMode === 'months' ) {
        return this.viewYear;
      }

      return '';
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

  watch: {
    modelValue() {
      if( _.isDate( this.modelValue ) && this.myValue !== this.modelValue ) {
        this.myValue = this.modelValue;

        this.myYear  = this.modelValue.getFullYear();
        this.myMonth = this.modelValue.getMonth();
        this.myDate  = this.modelValue.getDate();

        this.viewYear = this.modelValue.getFullYear();
        this.viewMonth = this.modelValue.getMonth();
        this.viewDate = this.modelValue.getDate();
      }
    }
  },

  methods: {
    prevScreen() {
      var prev = null;

      if( this.viewMode === 'days' ) {
        prev = new Date(this.viewYear, this.viewMonth, 0);
      } else if( this.viewMode === 'months' ) {
        prev = new Date(this.viewYear - 1, this.viewMonth, 1);
      } else if( this.viewMode === 'years' ) {
        prev = new Date(this.viewYear - 12, this.viewMonth, 1);
      }

      if( prev ) {
        this.viewYear  = prev.getFullYear();
        this.viewMonth = prev.getMonth();
        this.viewDate  = prev.getDate();
      }
    },

    nextScreen() {
      var prev = null;

      if( this.viewMode === 'days' ) {
        prev = new Date(this.viewYear, this.viewMonth + 1, 1);
      } else if( this.viewMode === 'months' ) {
        prev = new Date(this.viewYear + 1, this.viewMonth, 1);
      } else if( this.viewMode === 'years' ) {
        prev = new Date(this.viewYear + 12, this.viewMonth, 1);
      }

      if( prev ) {
        this.viewYear  = prev.getFullYear();
        this.viewMonth = prev.getMonth();
        this.viewDate  = prev.getDate();
      }
    },

    toggleViewMode() {
      if( this.viewMode === 'days' ) {
        this.viewMode = 'months';
      } else if( this.viewMode === 'months' ) {
        this.viewMode = 'years';
      }
    },

    setDate( date ) {
      if( !this.isDateEnabled( date ) ) {
        return;
      }

      this.viewMode = 'days';

      this.myYear  = this.viewYear  = date.getFullYear();
      this.myMonth = this.viewMonth = date.getMonth();
      this.myDate  = this.viewDate  = date.getDate();

      this.myValue = new Date( this.myYear, this.myMonth, this.myDate );

      this.$emit('update:modelValue', this.myValue);
    },

    setMonth( date ) {
      this.viewMode = 'days';

      if( this.myYear === date.getFullYear() && this.myMonth === date.getMonth() ) {
        return;
      }

      this.myYear  = this.viewYear = date.getFullYear();
      this.myMonth = this.viewMonth = date.getMonth();
      this.myDate = '';
    },

    setYear( date ) {
      this.viewMode = 'months';

      if( this.myYear === date.getFullYear() ) {
        return;
      }

      this.myYear  = this.viewYear = date.getFullYear();
      this.myMonth = '';
      this.myDate  = '';
    },

    compareDates( date1, date2 ) {
      var y1 = date1.getFullYear(), y2 = date2.getFullYear();
      var m1 = date1.getMonth(), m2 = date2.getMonth();
      var d1 = date1.getDate(), d2 = date2.getDate();

      if( y1 !== y2 ) {
        return y1 > y2 ? 1 : -1;
      }

      if( m1 !== m2 ) {
        return m1 > m2 ? 1 : -1;
      }

      if( d1 !== d2 ) {
        return d1 > d2 ? 1 : -1;
      }

      return 0;
    },

    isDateEnabled( date ) {
      if( this.minDate && this.compareDates(date, this.minDate) < 0 ) {
        return false;
      }

      if( this.maxDate && this.compareDates(date, this.maxDate) > 0 ) {
        return false;
      }

      return true;
    }
  },
}
</script>

<template>
  <div class="ct-datepicker">
    <div class="ct-datepicker-nav">
      <a href="#" @click.prevent="toggleViewMode" class="title">{{ viewTitle }}</a>
      <a href="#" @click.prevent="prevScreen" class="prev">
        <svg class="icon fill" width="15" height="24"><path fill-rule="evenodd" d="M11.856.54l2.211 2.211-9.056 9.057 9.056 9.057-2.211 2.211L.588 11.808 11.856.54z"/></svg>
      </a>
      <a href="#" @click.prevent="nextScreen" class="next">
        <svg class="icon fill ct-x-flip" width="15" height="24"><path fill-rule="evenodd" d="M11.856.54l2.211 2.211-9.056 9.057 9.056 9.057-2.211 2.211L.588 11.808 11.856.54z"/></svg>
      </a>
    </div>

    <div v-if="viewMode === 'days'">
      <div v-for="dow in enumDows" class="dow">{{ dow }}</div>

      <div v-for="day in enumDays" :class="day.class" @click.prevent="setDate(day.date)">
        <div class="title">{{ day.title }}</div>
      </div>
    </div>

    <div v-if="viewMode === 'months'">
      <div v-for="mon in enumMonths" :class="mon.class" @click.prevent="setMonth(mon.date)">
        <div class="title">{{ mon.title }}</div>
      </div>
    </div>

    <div v-if="viewMode === 'years'">
      <div v-for="year in enumYears" :class="year.class" @click.prevent="setYear(year.date)">
        <div class="title">{{ year.title }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ct-datepicker {
  min-width: 300px;
}

.ct-datepicker .opt,
.ct-datepicker .dow {
  display: inline-block;
  padding: 10px;
  color: inherit;
  cursor: pointer;
  position: relative;
  text-align: center;
}

.ct-datepicker .day,
.ct-datepicker .dow {
  width: 14.285714286%;
}

.ct-datepicker .mon,
.ct-datepicker .year {
  width: 25%;
}

.ct-datepicker .opt.selected {
  color: #FFF;
  background-color: #F00;
  border-radius: 4px;
}

.ct-datepicker .opt.prev,
.ct-datepicker .opt.next
{
  opacity: 0.4;
}

.ct-datepicker-nav {
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  align-items: center;

}

.ct-datepicker-nav a {
  color: inherit;
  text-align: center;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
}

.ct-datepicker-nav a:focus {
  text-decoration: none;
}

.ct-datepicker-nav a:hover {
  color: #F00;
}

.ct-datepicker-nav a.prev,
.ct-datepicker-nav a.next {
  flex: 0 0 auto;
}

.ct-datepicker-nav a.title {
  flex: 1 0 auto;
  text-align: left;
}

</style>