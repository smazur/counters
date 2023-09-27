<script>
import _ from 'lodash';

export default {
  name: "Datepicker",

  props: ['modelValue', 'start_date', 'end_date', 'view_date',
    'isHighlight', 'isMonthHighlight', 'isYearHighlight'
  ],

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

        if( _.isFunction( this.isYearHighlight ) && this.isYearHighlight( year.date ) ) {
          year.class.push('hl');
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

        if( _.isFunction( this.isMonthHighlight ) && this.isMonthHighlight( mon.date ) ) {
          mon.class.push( 'hl' );
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

        if( _.isFunction( this.isHighlight ) && this.isHighlight( now ) ) {
          day.class.push( 'hl' );
        }

        if( now.getMonth() < this.viewMonth ) {
          day.class.push('prev');
        } else if( now.getMonth() > this.viewMonth ) {
          day.class.push('next');
        }

        if( now.getFullYear() === this.myYear && now.getMonth() === this.myMonth && now.getDate() === this.myDate ) {
          day.class.push('selected');
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
      return [
        this.$tr( 'January' ) || 'January',
        this.$tr( 'February' ) || 'February',
        this.$tr( 'March' ) || 'March',
        this.$tr( 'April' ) || 'April',
        this.$tr( 'May' ) || 'May',
        this.$tr( 'June' ) || 'June',
        this.$tr( 'July' ) || 'July',
        this.$tr( 'August' ) || 'August',
        this.$tr( 'September' ) || 'September',
        this.$tr( 'October' ) || 'October',
        this.$tr( 'November' ) || 'November',
        this.$tr( 'December' ) || 'December'
      ];
    },

    allMon() {
      return [
        this.$tr( 'Jan' ) || 'Jan',
        this.$tr( 'Feb' ) || 'Feb',
        this.$tr( 'Mar' ) || 'Mar',
        this.$tr( 'Apr' ) || 'Apr',
        this.$tr( 'May' ) || 'May',
        this.$tr( 'Jun' ) || 'Jun',
        this.$tr( 'Jul' ) || 'Jul',
        this.$tr( 'Aug' ) || 'Aug',
        this.$tr( 'Sep' ) || 'Sep',
        this.$tr( 'Oct' ) || 'Oct',
        this.$tr( 'Nov' ) || 'Nov',
        this.$tr( 'Dec' ) || 'Dec'
      ];
    },

    enumDows() {
      return [
        this.$tr( 'Su' ) || 'Su',
        this.$tr( 'Mo' ) || 'Mo',
        this.$tr( 'Tu' ) || 'Tu',
        this.$tr( 'We' ) || 'We',
        this.$tr( 'Th' ) || 'Th',
        this.$tr( 'Fr' ) || 'Fr',
        this.$tr( 'Sa' ) || 'Sa'
      ];
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
    }
  },
}
</script>

<template>
  <div class="ct-datepicker">
    <div class="ct-datepicker-nav fl-row fl-gap-1 ph-min">
      <a href="#" @click.prevent="toggleViewMode()" class="fl-grow ct-btn-tool" style="text-align: left">{{ viewTitle }}</a>
      <a href="#" @click.prevent="prevScreen" class="ct-btn-tool">
        <i class="fa-solid fa-chevron-left"></i>
      </a>
      <a href="#" @click.prevent="nextScreen" class="ct-btn-tool">
        <i class="fa-solid fa-chevron-right"></i>
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

</style>