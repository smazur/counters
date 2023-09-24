<script>
import {getDateKey} from "../utils.js";
import AppScreen from "./AppScreen.vue";

export default {
  name: "MonthReport",
  components: {AppScreen},

  computed: {
    gid() {
      return this.$route.params.gid;
    },

    state() {
      return JSON.parse( localStorage.getItem( 'state' ) );
    },

    group() {
      return this.state ? this.state.groups[this.gid] : undefined;
    },

    cids() {
      return this.group ? this.group.counters : [];
    },

    monthDate() {
      let d = this.$route.params.date;
      let dateMatch;

      if( !d || !( dateMatch = d.match(/^(\d\d\d\d)-(\d\d?)/) ) ) {
        let monthDate = new Date();
        monthDate.setDate( 1 );
        return monthDate;
      }

      return new Date( dateMatch[1], dateMatch[2] - 1, 1 );
    },

    monthTitle() {
      let d = this.monthDate;
      let y = d.getFullYear(), m = ('' + (d.getMonth() + 1)).padStart(2, '0');
      return y + '-' + m;
    },

    prevMonthPath() {
      let d = new Date( this.monthDate );
      d.setMonth( d.getMonth() - 1 );
      let y = d.getFullYear(), m = ('' + (d.getMonth() + 1)).padStart(2, '0');

      return '/report/month/' + this.gid + '/' + y + '-' + m;
    },

    nextMonthPath() {
      let d = new Date( this.monthDate );
      d.setMonth( d.getMonth() + 1 );
      let y = d.getFullYear(), m = ('' + (d.getMonth() + 1)).padStart(2, '0');

      return '/report/month/' + this.gid + '/' + y + '-' + m;
    },

    items() {
      let d = new Date( this.monthDate );
      let items = [];
      let cids = this.cids;

      do {
        let key = getDateKey( d );
        let data = JSON.parse( localStorage.getItem( key ) );

        if( data ) {
          let sum = 0, count = 0;

          cids.map((cid) => {
            let val = parseInt( data[cid] );
            if( !isNaN( val ) ) {
              sum += val;
              count++;
            }
          });

          if( count > 0 ) {
            items.push({
              key: getDateKey( d ),
              date: new Date( d ),
              sum: sum,
              avg: Math.round( 100 * sum / count ) / 100,
            });
          }
        }

        d.setDate( d.getDate() + 1 );
      } while ( d.getDate() !== 1 );

      return items;
    },

    totalSum() {
      let total = 0;
      let items = this.items;
      for( let i in items ) {
        total += items[i].sum;
      }

      return total;
    },

    needAvg() {
      return this.group && this.group.counters.length > 1;
    }
  },
}
</script>

<template>
  <AppScreen show-header="1" show-footer="1">
   <template v-slot:header>
     <router-link to="/" class="ct-btn-tool"><i class="fa-solid fa-home"></i></router-link>
     <div v-if="group" class="ct-ellipsis">{{ group.title }}</div>
   </template>
    <template v-slot:footer>
      <div class="ph1 pv1 fl-row fl-center fl-al-center fl-gap-1">
        <router-link :to="prevMonthPath" class="ct-btn-tool"><i class="fa-solid fa-chevron-left"></i></router-link>
        <div>{{ monthTitle }}</div>
        <router-link :to="nextMonthPath" class="ct-btn-tool"><i class="fa-solid fa-chevron-right"></i></router-link>
      </div>
    </template>

    <table class="ct-table">
      <thead>
      <tr>
        <th>Date</th>
        <th>SUM</th>
        <th v-if="needAvg">AVG</th>
      </tr>
      </thead>
      <tfoot>
        <tr>
          <th>Total</th>
          <td>{{ totalSum }}</td>
          <td v-if="needAvg"></td>
        </tr>
      </tfoot>

      <tbody>
      <tr v-for="item in items">
        <th>
          {{ item.date.toLocaleDateString() }}
        </th>
        <td>
          {{ item.sum }}
        </td>
        <td v-if="needAvg">
          {{ item.avg }}
        </td>
      </tr>
      </tbody>
    </table>
  </AppScreen>
</template>

<style scoped>

</style>