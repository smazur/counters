<script>
import _ from "lodash";
import Counter from "./Counter.vue";
import Datepicker from "./Datepicker.vue";
import AppScreen from "./AppScreen.vue";
import {getDateKey} from "../utils.js";
import Calendar from "./Calendar.vue";

export default {
  name: "Home",
  components: {
    Calendar,
    AppScreen,
    Datepicker,
    Counter
  },

  data() {
    return {
      groupMenuOpen: null,
      prompt: null,
      confirm: null,
      counterMenu: null,
      calendarOpen: false,
      datepickerOpen: false,
      isStateLoading: false,
      state: {
        counterId: 0,
        groupId: 0,
        activeGroupId: 1,
        counters: {},
        groups: {},
        groupsOrder: [],
      },
      currentDate: new Date(),
      currentCounters: {},
      isDateHighlighted: null,
      isMonthHighlighted: null,
      scrollCounter: 0,

    }
  },

  computed : {
    activeGroup() {
      return this.state.groups[this.state.activeGroupId];
    },

    activeCounters() {
      let counters = [];

      if( this.activeGroup ) {
        this.activeGroup.counters.forEach( (cid) => {
          counters.push( this.state.counters[cid] );
        });
      }

      return counters;
    },

    currentDateKey() {
      return getDateKey( this.currentDate );
    },

    displayGroups() {
      let groups = [];

      this.state.groupsOrder.forEach( (gid) => {
        groups.push( this.state.groups[gid] );
      });

      return groups;
    },

    groupStats() {
      let res = {};

      for( let gid in this.state.groups ) {
        res[gid] = this.getGroupStats( this.state.groups[gid] );
      }

      return res;
    }
  },

  watch: {
    state: {
      handler: 'saveState',
      deep: true,
    },
    currentCounters: {
      handler: _.debounce(function() {
        this.saveDataForCurrentDate();
      }, 250),
      deep: true,
    }
  },

  mounted() {
    this.isDateHighlighted = ( d ) => {
      return this.getDateStatus( d );
    };

    this.isMonthHighlighted = ( d ) => {
      return this.getMonthStatus( d );
    };

    this.loadState();
    this.loadDataForCurrentDate();
  },

  methods: {
    loadState() {
      this.isStateLoading = true;

      let state = JSON.parse( localStorage.getItem( 'state' ) );

      if( state ) {

        if( !( 'activeGroupId' in state ) ) {
          state.activeGroupId = 1;
        }

        this.state = state;
      } else {
        this.state = {
          counterId: 1,
          groupId: 1,
          activeGroupId: 1,
          counters: {
            1: {
              id: 1,
              gid: 1,
              title: '',
              count: '',
            }
          },
          groups: {
            1: {
              id: 1,
              title: 'General',
              counters: [1],
            }
          },
          groupsOrder: [1],
        };
      }

      this.$nextTick( () => {
        this.isStateLoading = false;
      });
    },

    wipe() {
      localStorage.clear();
      this.loadState();
      this.loadDataForCurrentDate();
    },

    wipeConfirm() {
      this.openConfirm({
        message: 'Are you sure want to wipe all data?',
      }, () => {
        this.wipe();
      });
    },

    saveState() {
      if( this.isStateLoading ) {
        return;
      }

      localStorage.setItem( 'state', JSON.stringify( this.state ) );
    },

    loadDataForCurrentDate() {
      this.currentCounters = JSON.parse( localStorage.getItem( this.currentDateKey ) ) || {};
    },

    saveDataForCurrentDate() {
      localStorage.setItem( this.currentDateKey, JSON.stringify( this.currentCounters ) );
    },

    setDate( date ) {
      this.datepickerOpen = false;

      this.currentDate = date;
      this.loadDataForCurrentDate();
    },

    prevDate() {
      let currentDate = new Date( this.currentDate );
      currentDate.setDate( currentDate.getDate() - 1 );
      this.currentDate = currentDate;
      this.loadDataForCurrentDate();
    },

    nextDate() {
      let currentDate = new Date( this.currentDate );
      currentDate.setDate( currentDate.getDate() + 1 );
      this.currentDate = currentDate;
      this.loadDataForCurrentDate();
    },

    addCounter( groupId ) {
      if( !(groupId in this.state.groups) ) {
        return;
      }

      let group = this.state.groups[groupId];
      let id = ++this.state.counterId;
      let title = '';
      if( group.counters.length ) {
        let lastCounterId = group.counters[group.counters.length - 1];
        let lastCounter = this.state.counters[lastCounterId];
        let numberMatch = lastCounter.title.match(/(\d+)/);
        if( numberMatch ) {
          title = lastCounter.title.replace(/(\d+)/, parseInt( numberMatch[0] ) + 1 );
        }
      }

      this.state.counters[id] = {
        id: id,
        gid: groupId,
        title: title,
        count: '',
      };

      group.counters.push( id );

      let counterIdx = group.counters.length - 1;

      this.$nextTick(() => {
        this.$refs.counter[counterIdx].focusTitle();
      });
    },

    clearCounter( cid ) {
      this.counterMenu = null;
      this.currentCounters[cid] = '';
    },

    deleteCounter( cid ) {
      if( !( cid in this.state.counters ) ) {
        return;
      }

      let counter = this.state.counters[cid];
      let group = this.state.groups[counter.gid];
      if( !group ) {
        return;
      }

      let idx = group.counters.indexOf( cid );
      if( idx >= 0 ) {
        group.counters.splice( idx, 1 );
      }

      delete this.state.counters[cid];
    },

    deleteCounterConfirm( cid ) {
      this.counterMenu = null;

      if( !( cid in this.state.counters ) ) {
        return;
      }

      let counter = this.state.counters[cid];

      if( !counter.title ) {
        this.deleteCounter( cid );
        return;
      }

      this.openConfirm({
        message: 'Delete "' + counter.title + '"?',
      }, () => {
        this.deleteCounter( cid );
      });
    },

    addGroup() {
      this.openPrompt({
        message: 'Enter group name:',
      }, ( value ) => {
        let title = (value || '').trim();

        if( !title ) {
          return;
        }

        let id = ++this.state.groupId;

        this.state.groups[id] = {
          id: id,
          title: title,
          counters: [],
        };

        this.state.groupsOrder.push( id );
        this.state.activeGroupId = id;

        this.addCounter( id )
      })
    },

    getGroupSum( group ) {
      let sum;

      group.counters.forEach((cid) => {
        let val = this.currentCounters[cid];
        if( val !== '' && val !== undefined ) {
          if( sum === undefined ) {
            sum = 0;
          }
          sum += val;
        }
      });

      return sum;
    },

    getGroupAvg( group ) {
      let sum = 0, count = 0;

      group.counters.forEach((cid) => {
        let val = this.currentCounters[cid];
        if( val !== '' && val !== undefined ) {
          sum += val;
          count++;
        }
      });

      return count === 0 ? undefined : Math.round( 100 * sum / count ) / 100;
    },

    getGroupStats( group ) {
      let sum, count = 0;

      group.counters.forEach((cid) => {
        let val = this.currentCounters[cid];

        if( val !== '' && val !== undefined ) {
          if( sum === undefined ) {
            sum = 0;
          }

          sum += val;
          count++;
        }
      });

      return {
        sum,
        count,
        avg: count > 0 ? Math.round( 100 * sum / count ) / 100 : undefined,
        length: group.counters.length
      };
    },

    getGroupCounters( group ) {
      let counters = [];

      group.counters.forEach( (cid) => {
        counters.push( this.state.counters[cid] );
      });

      return counters;
    },

    openGroup( groupId ) {
      this.state.activeGroupId = groupId;
      this.$refs.screen.closeSidebar();
    },

    openGroupMenu( groupId ) {
      this.groupMenuOpen = groupId;
    },


    openPrompt( opts, cb ) {
      this.prompt = _.extend({value: '', placeholder: '', callback: cb}, opts );
    },

    closePrompt( value ) {
      if( !this.prompt ) {
        return;
      }

      if( this.prompt.callback ) {
        this.prompt.callback.call( this, value );
      }

      this.prompt = null;
    },

    openConfirm(opts, ycb, ncb ) {
      this.confirm = _.extend({ message: '', yesTitle: 'Ok', noTitle: 'Cancel', ycb: ycb, ncb: ncb }, opts );
    },

    closeConfirm( choice ) {
      if( !this.confirm ) {
        return;
      }

      if( choice ) {
        this.confirm.ycb && this.confirm.ycb.call( this );
      } else {
        this.confirm.ncb && this.confirm.ncb.call( this );
      }

      this.confirm = null;
    },

    renameGroup( groupId ) {
      if( !( groupId in this.state.groups ) ) {
        return;
      }

      this.openPrompt({
        message: 'Enter new title:',
        value: this.state.groups[groupId].title,
      }, ( res ) => {
        let title = ( res || '' ).trim();

        if( !title ) {
          return;
        }

        this.state.groups[groupId].title = title;
      });

      this.groupMenuOpen = null;
    },

    deleteGroup( groupId ) {
      this.groupMenuOpen = null;

      if( !( groupId in this.state.groups ) ) {
        return;
      }

      // noinspection EqualityComparisonWithCoercionJS
      if( groupId == 1 ) {
        return;
      }

      // noinspection EqualityComparisonWithCoercionJS
      if( groupId == this.state.activeGroupId ) {
        let newActiveGid = null;

        for( let gid in this.state.groups ) {
          // noinspection EqualityComparisonWithCoercionJS
          if( gid != groupId ) {
            newActiveGid = gid;
            break;
          }
        }

        this.state.activeGroupId = newActiveGid;
      }

      let idx = this.state.groupsOrder.indexOf( groupId );

      if( idx >= 0 ) {
        this.state.groupsOrder.splice( idx, 1 );
      }

      delete this.state.groups[groupId];
    },

    deleteGroupConfirm( groupId ) {
      if( !( groupId in this.state.groups ) ) {
        return;
      }

      // noinspection EqualityComparisonWithCoercionJS
      if( groupId == 1 ) {
        return;
      }

      let group = this.state.groups[groupId];

      this.openConfirm({
        message: 'Delete group "' + group.title + '"?',
      }, () => {
        this.deleteGroup( groupId );
      });
    },

    openCounterMenu( cid ) {
      this.counterMenu = {
        cid: cid,
      };
    },

    getDateStatus( d ) {
      if( !this.activeGroup ) {
        return 0;
      }

      let counters = this.activeGroup.counters;
      let data = JSON.parse( localStorage.getItem( getDateKey( d ) ) );

      if( !data ) {
        return 0;
      }

      return _.reduce( counters, (ct, cid) => {
        let val = parseInt(data[cid]);
        return ct + (isNaN(val) || val === 0 ? 0 : 1);
      }, 0 );
    },

    getMonthStatus( d ) {
      if( !this.activeGroup ) {
        return 0;
      }

      let counters = this.activeGroup.counters;
      let monthKey = [d.getFullYear(), d.getMonth() + 1, ''].join('-');
      let valNum = 0;

      for( let key in localStorage ) {
        if( !localStorage.hasOwnProperty( key ) ) {
          continue;
        }

        if( !key.startsWith( monthKey ) ) {
          continue;
        }

        let data = JSON.parse( localStorage.getItem( key ) );

        if( !data ) {
          continue;
        }

        _.map( counters, (cid) => {
          let val = parseInt(data[cid]);
          valNum += (isNaN(val) || val === 0 ? 0 : 1);
        });
      }

      return valNum;
    },

    getYearStatus( d ) {
      if( !this.activeGroup ) {
        return 0;
      }

      let counters = this.activeGroup.counters;
      let yearKey = d.getFullYear() + '-';
      let valNum = 0;

      for( let key in localStorage ) {
        if( !localStorage.hasOwnProperty( key ) ) {
          continue;
        }

        if( !key.startsWith( yearKey ) ) {
          continue;
        }

        let data = JSON.parse( localStorage.getItem( key ) );

        if( !data ) {
          continue;
        }

        _.map( counters, (cid) => {
          let val = parseInt(data[cid]);
          valNum += (isNaN(val) || val === 0 ? 0 : 1);
        });
      }

      return valNum;
    },

  }
}
</script>

<template>
  <AppScreen show-header="1" show-footer="1" show-sidebar="1" ref="screen">
    <template v-slot:header>
      <a v-if="activeGroup" href="#" class="ct-group-title ct-ellipsis" style="flex:1" @click.prevent="renameGroup( activeGroup.id )">{{ activeGroup.title }}</a>

      <div v-if="activeGroup" style="flex:0" class="ct-nowrap x-gap-1">
        <span class="ct-badge ct-enum">
          <span>{{ groupStats[activeGroup.id].length }}</span>
          <span v-if="groupStats[activeGroup.id].sum !== undefined">{{ groupStats[activeGroup.id].sum }}</span>
          <span v-if="groupStats[activeGroup.id].count > 1">{{ groupStats[activeGroup.id].avg }}</span>
        </span>
        <a href="#" class="ct-btn-tool" @click.prevent="calendarOpen = true"><i class="fa-regular fa-calendar-days"></i></a>
      </div>
    </template>

    <template v-slot:footer>
      <div class="ph1 pv1 fl-row x-gap-1" style="align-items: center;justify-content: center">
        <!--suppress EqualityComparisonWithCoercionJS -->
        <a href="#" v-if="activeGroup" class="ct-btn-tool ct-danger" :class="{'ct-disabled': activeGroup.id == 1}" @click.prevent="deleteGroupConfirm(activeGroup.id)"><i class="fa-solid fa-trash"></i></a>
        <a href="#" class="ct-btn-tool" @click.prevent="prevDate()"><i class="fa-solid fa-chevron-left"></i></a>
        <a href="#" class="ct-btn-tool" @click.prevent="datepickerOpen = true">{{ currentDate.toLocaleDateString() }}</a>
        <a href="#" class="ct-btn-tool" @click.prevent="nextDate()"><i class="fa-solid fa-chevron-right"></i></a>
        <a href="#" v-if="activeGroup" class="ct-btn-tool" @click.prevent="addCounter( activeGroup.id )"><i class="fa-solid fa-plus"></i></a>
      </div>
    </template>

    <template v-slot:sidebar>
      <div class="fl-col h100">
        <div class="fl-grow-scroll-y">
          <ul class="ct-menu">
            <li v-for="group in displayGroups" :key="group.id" :class="{'ct-active': state.activeGroupId === group.id}">
              <a href="#" @click.prevent="openGroup( group.id )">
                <div class="fl-row fl-gap-1">
                  <div class="ct-ellipsis" style="flex: 1 0 0">{{ group.title }}&nbsp;</div>
                  <div class="x-gap-1" style="flex: 0 0 0">
                    <span class="ct-badge ct-enum">
                      <span>{{ groupStats[group.id].length }}</span>
                      <span v-if="groupStats[group.id].sum !== undefined">{{ groupStats[group.id].sum }}</span>
                      <span v-if="groupStats[group.id].count > 1">{{ groupStats[group.id].avg }}</span>
                    </span>
                  </div>
                </div>
              </a>
            </li>
          </ul>
        </div>
        <div class="pv1 ph1">
          <div class="ct-btn-group">
            <button type="button" class="ct-btn" @click.prevent="addGroup()">Add group</button>
            <button type="button" class="ct-btn" @click.prevent="wipeConfirm()">Wipe data</button>
          </div>
        </div>
      </div>
    </template>


    <div v-if="activeGroup" class="fl-grow-scroll-y">
      <ul class="ct-counter-list">
        <li v-for="counter in activeCounters" :key="counter.id">
          <Counter v-model:title="counter.title" v-model:count="currentCounters[counter.id]" @delete="deleteCounterConfirm(counter.id)" @menu="openCounterMenu(counter.id)" ref="counter"></Counter>
        </li>
      </ul>
    </div>
  </AppScreen>

  <transition name="ct-fade" @enter="$refs.prompt.focus()">
    <div v-if="prompt" class="ct-popup" @click.self="closePrompt()">
      <div class="ct-popup-body ph1 pv1">
        <div v-if="prompt.message">{{ prompt.message }}</div>
        <input type="text" class="w100" v-model="prompt.value" :placeholder="prompt.placeholder || ''" @keydown.enter.prevent="closePrompt(this.prompt.value)" @keydown.esc.prevent="closePrompt()" ref="prompt">
      </div>
    </div>
  </transition>

  <transition name="ct-fade">
    <div v-if="confirm" class="ct-popup" @click.self="closeConfirm(false)">
      <div class="ct-popup-body ph1 pv1 y-gap-1" style="text-align: center">
        <div v-if="confirm.message">{{ confirm.message }}</div>
        <div v-if="confirm.reverse" class="ct-btn-group">
          <button type="button" class="ct-btn" @click.prevent="closeConfirm(false)">{{ confirm.noTitle }}</button>
          <button type="button" class="ct-btn" @click.prevent="closeConfirm( true )">{{ confirm.yesTitle }}</button>
        </div>
        <div v-else class="ct-btn-group">
          <button type="button" class="ct-btn" @click.prevent="closeConfirm(false)">{{ confirm.noTitle }}</button>
          <button type="button" class="ct-btn" @click.prevent="closeConfirm( true )">{{ confirm.yesTitle }}</button>
        </div>
      </div>
    </div>
  </transition>

  <transition name="ct-fade">
    <div v-if="counterMenu" class="ct-popup" @click.self="counterMenu = null">
      <div class="ct-popup-body pv1">
        <ul class="ct-menu">
          <li>
            <!--suppress JSObjectNullOrUndefined -->
            <a href="#" @click.prevent="clearCounter(counterMenu.cid)">Clear</a>
          </li>
          <li><hr></li>
          <li>
            <a href="#" @click.prevent="deleteCounterConfirm(counterMenu.cid);">Delete</a>
          </li>
        </ul>
      </div>
    </div>
  </transition>

  <transition name="ct-fade">
    <div v-if="datepickerOpen" class="ct-popup" @click.self="datepickerOpen = false">
      <div class="ct-popup-body ph1 pv1 y-gap-1">
        <Datepicker :model-value="currentDate" @update:modelValue="setDate($event)" :is-highlight="getDateStatus" :is-month-highlight="getMonthStatus" :is-year-highlight="getYearStatus"></Datepicker>
        <div style="text-align: center">
          <a href="#" class="ct-btn-tool" @click.prevent="setDate(new Date())">Today</a>
        </div>
      </div>
    </div>
  </transition>

  <transition name="ct-fade">
  <div v-if="activeGroup && calendarOpen" class="ct-popup" @click.self="calendarOpen = false">
    <div class="ct-popup-body" style="height:500px;width:100%">
      <Calendar :cids="activeGroup.counters" :view-date="currentDate"></Calendar>
    </div>
  </div>
  </transition>
</template>

<style scoped>
</style>
