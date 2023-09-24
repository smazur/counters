<script>
export default {
  name: "TouchMoveCounter",
  props: ['modelValue', 'incOptions'],
  data() {
    return {
      myValue: this.modelValue,
      handlers: [],
      inc: 1,
    }
  },

  mounted() {
    this.installHandlers();
  },

  beforeUnmount() {
    this.uninstallHandlers();
  },

  methods: {
    installHandlers() {
      let touchStartedV = null;
      let touchStartedY = null;
      let touchLastY = null;
      let timer = null;
      let inc = 0;
      let val = 0;


      let tick = () => {
        val += inc;

        this.myValue = Math.floor( val );
      };

      let touchStart = (y) => {
        touchStartedY = touchLastY = y;
        touchStartedV = parseInt( this.myValue );

        if( isNaN( touchStartedV ) ) {
          touchStartedV = 0;
        }

        val = touchStartedV;
        inc = 0;

        timer = setInterval(tick, 16);
      };

      let touchEnd = () => {
        if( touchStartedY === null ) {
          return;
        }

        clearInterval( timer );

        touchStartedY = null;
        timer = null;
      };

      let touchMove = (y) => {
        if( touchStartedY === null ) {
          return;
        }

        touchLastY = y;
        inc = Math.sign( (touchStartedY - y) ) * Math.pow( (touchStartedY - y) * 0.005, 2 );
        if( Math.abs( inc ) < 0.01 ) {
          inc = 0;
        }
      };

      this.addHandler( this.$refs.counter, 'touchstart',  (e) => {
        e.preventDefault();
        touchStart( e.changedTouches[0].pageY );
      });

      this.addHandler( document, 'touchmove', (e) => {
        touchMove( e.changedTouches[0].pageY );
      });

      this.addHandler( document, 'touchend', () => {
        touchEnd();
      });

      this.addHandler(this.$refs.counter, 'mousedown', (e) => {
        e.preventDefault();
        touchStart( e.pageY );
        return false;
      });

      this.addHandler( document, 'mousemove', (e) => {
        touchMove( e.pageY );
      });

      this.addHandler( document, 'mouseup', () => {
        touchEnd();
      });

      this.addHandler( this.$refs.counter, 'wheel', (e) => {
        let v = parseInt( this.myValue );

        if( isNaN( v ) ) {
          v = 0;
        }

        this.myValue = v + Math.round( e.deltaY * 0.01 );
      } );
    },

    uninstallHandlers() {
      for( let i in this.handlers ) {
        let item = this.handlers[i];
        item.el.removeEventListener( item.event, item.callback );
      }
    },

    addHandler( el, event, callback ) {
      el.addEventListener( event, callback );

      this.handlers.push({
        el, event, callback
      });
    },

    add( n ) {
      let val = parseInt( this.myValue );

      if( isNaN( val ) ) {
        val = 0;
      }

      this.myValue = val + n;
    },
  }
}
</script>

<template>
  <div>
    <slot name="title"></slot>
    <div class="y-gap-1">
      <div class="fl-row fl-gap-1" style="justify-content: center;align-items: center">
        <a href="#" class="ct-btn-tool" @click.prevent="add(-inc)"><i class="fa-solid fa-minus"></i></a>
        <div class="ct-tm-counter" ref="counter">{{ this.myValue }}</div>
        <a href="#" class="ct-btn-tool" @click.prevent="add(inc)"><i class="fa-solid fa-plus"></i></a>
      </div>
      <div v-if="incOptions" class="fl-row fl-gap-1" style="flex-wrap: nowrap">
        <a v-for="opt in incOptions" href="#" class="ct-btn-tool fl-1" :class="{active: inc === opt.amount}" @click.prevent="inc = opt.amount">{{ opt.title || opt.amount }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ct-tm-counter {
  text-align: center;
  font-size: 36px;
  min-width: 100px;
  background-color: #F5F5F5;
  border-radius: 5px;
  padding: 0 10px;
}
</style>