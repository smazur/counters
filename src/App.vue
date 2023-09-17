<script>
import _ from "lodash";
import Counter from "./components/Counter.vue";
import Datepicker from "./components/Datepicker.vue";


export default {
  components: {
    Datepicker,
    Counter
  },

  data() {
    return {
      sidebarOpen: false,
      groupMenuOpen: null,
      prompt: null,
      confirm: null,
      counterMenu: null,
      datepickerOpen: false,
      state: {
        counterId: 0,
        groupId: 0,
        activeGroupId: 1,
        counters: {},
        groups: {},
        groupsOrder: [],
        currentDate: new Date(),
      },
      currentCounters: {},
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
      let d = this.state.currentDate;
      return [ d.getFullYear(), d.getMonth() + 1, d.getDate() ].join('-');
    },

    displayGroups() {
      let groups = [];

      this.state.groupsOrder.forEach( (gid) => {
        groups.push( this.state.groups[gid] );
      });

      return groups;
    }
  },

  watch: {
    state: {
      handler: 'saveState',
      deep: true,
    }
  },

  mounted() {
    this.loadState();
    this.loadDataForCurrentDate();
  },

  methods: {
    loadState() {
      let state = JSON.parse( localStorage.getItem( 'state' ) );

      if( state ) {

        if( !( 'activeGroupId' in state ) ) {
          state.activeGroupId = 1;
        }

        this.state = state;
        this.state.currentDate = new Date( this.state.currentDate );
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
          currentDate: new Date(),
        };
      }
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
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

      this.saveDataForCurrentDate();
      this.state.currentDate = date;
      this.loadDataForCurrentDate();
    },

    prevDate() {
      this.saveDataForCurrentDate();
      let currentDate = new Date( this.state.currentDate );
      currentDate.setDate( currentDate.getDate() - 1 );
      this.state.currentDate = currentDate;
      this.loadDataForCurrentDate();
    },

    nextDate() {
      this.saveDataForCurrentDate();
      let currentDate = new Date( this.state.currentDate );
      currentDate.setDate( currentDate.getDate() + 1 );
      this.state.currentDate = currentDate;
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
      let sum = '';

      group.counters.forEach((cid) => {
         let val = this.currentCounters[cid];
         if( val !== '' && val !== undefined ) {
           if( sum === '' ) {
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

      return count === 0 ? '' : Math.round( 100 * sum / count ) / 100;
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
      this.sidebarOpen = false;
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

      if( groupId == this.state.activeGroupId ) {
        let newActiveGid = null;

        for( let gid in this.state.groups ) {
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
    }
  }
}
</script>

<template>
  <div class="ct-app">

    <div class="ct-header">
      <div class="fl-row h100" style="column-gap: 10px;justify-content: space-between;align-items: center">
        <div class="fl-row fl-grow" style="column-gap: 10px;align-items: center">
          <div class="fl-shrink">
            <a href="#" class="ct-btn-tool" @click.prevent="toggleSidebar()">
              <i class="fa-solid fa-bars"></i>
            </a>
          </div>
          <div v-if="activeGroup" class="fl-grow fl-row">
            <div class="fl-grow">
              <a href="#" class="ct-header-title" @click.prevent="renameGroup( activeGroup.id )">{{ activeGroup.title }}</a>
            </div>
            <div class="x-gap-1">
              <span class="ct-badge">{{ activeGroup.counters.length }}</span>
              <span class="ct-badge">{{ getGroupSum( activeGroup ) }} / {{ getGroupAvg( activeGroup ) }}</span>
            </div>
          </div>
        </div>

        <div class="ct-date">
          <a href="#" class="ct-btn-tool" @click.prevent="prevDate()"><i class="fa-solid fa-chevron-left"></i></a>
          <a href="#" class="ct-btn-tool" @click.prevent="datepickerOpen = true">{{ state.currentDate.toLocaleDateString() }}</a>
          <a href="#" class="ct-btn-tool" @click.prevent="nextDate()"><i class="fa-solid fa-chevron-right"></i></a>
        </div>
      </div>
    </div>

    <div class="ct-body">
      <div class="fl-col h100">

        <div v-if="activeGroup" class="fl-grow-scroll-y">
            <ul class="ct-counter-list">
              <li v-for="counter in activeCounters" :key="counter.id">
                <Counter v-model:title="counter.title" v-model:count="currentCounters[counter.id]" @delete="deleteCounterConfirm(counter.id)" @menu="openCounterMenu(counter.id)"></Counter>
              </li>
            </ul>
        </div>

        <div v-if="activeGroup">
         <div class="ct-btn-group">
           <button v-if="activeGroup.id != 1" type="button" class="ct-btn ct-danger" @click.prevent="deleteGroupConfirm(activeGroup.id)"><i class="fa-solid fa-trash"></i> Delete</button>
           <button type="button" class="ct-btn" @click.prevent="addCounter( activeGroup.id )"><i class="fa-solid fa-plus"></i> Add</button>
         </div>
        </div>
      </div>
    </div>

    <div class="ct-sidebar" :class="{'ct-sidebar-open': sidebarOpen}" @click.self="toggleSidebar()">
      <div class="ct-sidebar-body">
        <div class="h100">
          <div class="fl-col h100">
            <div class="fl-grow-scroll-y">
              <ul class="ct-menu">
                <li v-for="group in displayGroups" :key="group.id" :class="{'ct-active': state.activeGroupId === group.id}">
                  <a href="#" @click.prevent="openGroup( group.id )">{{ group.title }}&nbsp;
                    <div class="x-gap-1" style="float:right">
                      <span class="ct-badge">{{ group.counters.length }}</span>
                      <span class="ct-badge">{{ getGroupSum( group ) }} / {{ getGroupAvg( group ) }}</span>
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
        </div>
      </div>
    </div>

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
      <div class="ct-popup-body ph1 pv1">
        <Datepicker :model-value="this.state.currentDate" @update:modelValue="setDate($event)"></Datepicker>
      </div>
    </div>
    </transition>

  </div>
</template>

<style scoped>
.ct-app {
  width: 100%;
  overflow: hidden;
  position: relative;
  min-height: 100vh;

  --header-size: 50px;

  --menu-bg: #FFF;
  --menu-fg: #000;

  --menu-hover-fg: #000;
  --menu-hover-bg: #EEE;

  --menu-active-fg: #000;
  --menu-active-bg: #DDD;

  --border-color: #BBB;
  --focus-border-color: #239898;

  --sidebar-fg: #FFF;
  --sidebar-bg: #213547;
}

.ct-group-header {
  display: flex;
  flex-direction: row;
}
.ct-group-header .ct-group-title {
  flex: 1 0 auto;
}
.ct-group .ct-group-body {
  display: none;
  padding-left: 32px;
}
.ct-group.ct-group-open .ct-group-body {
  display: block;
}
.ct-group.ct-group-open .ct-group-toggle {
  transform: rotateZ(90deg);
}

.ct-sidebar {
  position: fixed;
  top: var(--header-size);
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 0;
  background-color: rgba(0,0,0,0.5);
  transition: opacity .25s;
  z-index: 100;
  pointer-events: none;
}

.ct-sidebar-body {
  --menu-fg: var(--sidebar-fg);
  --menu-bg: var(--sidebar-bg);
  --menu-hover-fg: #FFF;
  --menu-hover-bg: rgba(0, 0, 0, 0.1);
  --menu-active-fg: #000;
  --menu-active-bg: #FFF;

  position: relative;
  left: -300px;
  width: 300px;
  height: 100%;
  overflow: hidden;
  transition: left .25s;

  color: var(--sidebar-fg);
  background-color: var(--sidebar-bg);

  -webkit-box-shadow: 4px 0px 5px 0px rgba(0,0,0,0.2);
  -moz-box-shadow: 4px 0px 5px 0px rgba(0,0,0,0.2);
  box-shadow: 4px 0px 5px 0px rgba(0,0,0,0.2);
}

.ct-sidebar.ct-sidebar-open {
  opacity: 1;
  pointer-events: initial;
}

.ct-sidebar.ct-sidebar-open .ct-sidebar-body {
  left: 0;
}

.ct-header {
  color: var(--sidebar-fg);
  background-color: var(--sidebar-bg);
  height: var(--header-size);
}

.ct-body {
  height: calc(100vh - var(--header-size));
  max-height: calc(100vh - var(--header-size));
}

.ct-menu {
  list-style-type: none;
  padding: 0;
  margin: 0;

  >li>a {
    display: block;
    text-decoration: none;
    padding: 5px 10px;
    color: var(--menu-fg);
    background-color: var(--menu-bg);
  }

  >li:hover>a {
    color: var(--menu-hover-fg);
    background-color: var(--menu-hover-bg);
  }

  >li.ct-active>a {
    color: var(--menu-active-fg);
    background-color: var(--menu-active-bg);
  }
  >li>hr {
    border:none;
    border-top: 1px solid #DDD;
    margin: 5px 0;
  }
}

.ct-sidebar-toggle {
  display: inline-block;
  width: 24px;
  height: 24px;
}

.ct-badge {
  display: inline-block;
  background-color: #FFF;
  color: #000;
  font-size: 14px;
  line-height: 1;
  padding: 4px 5px;
  min-width: 22px;
  text-align: center;
  border-radius: 100px;
}

.ct-counter-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.ct-counter-list>li {
  border-bottom: 1px solid #eee;
}

.ct-header-title {
  color: inherit;
  text-decoration: none;
  display: inline-block;
  border-bottom: 1px dashed currentColor;
}

.ct-scroll-view {
  position: relative;
}

.ct-scroll-body {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}
</style>
