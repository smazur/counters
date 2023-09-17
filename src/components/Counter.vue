<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: "Counter",
  props: ['title', 'count'],
  data() {
    return {
      myTitle: this.title || '',
      myCount: this.count !== undefined ? this.count : '',
    }
  },

  mounted() {
    this.$refs.title.focus();
  },

  watch: {
    count() {
      this.myCount = this.count;
    },

    myCount() {
      this.$emit( 'update:count', this.myCount );
    },

    myTitle() {
      this.$emit( 'update:title', this.myTitle );
    }
  },

  methods: {
    inc() {
      if( this.myCount === '' || this.myCount === undefined ) {
        this.myCount = 0;
      }

      this.myCount = this.myCount + 1;
    },
    dec() {
      if( this.myCount === '' || this.myCount === undefined ) {
        this.myCount = 0;
      }

      this.myCount = this.myCount - 1;
    },
    del() {
      this.$emit('delete' );
    },
    clear() {
      this.myCount = '';
    }
  }
})
</script>

<template>
<div class="ct">
  <input type="text" class="ct-title" v-model="myTitle" ref="title" placeholder="New counter">
  <div class="ct-val">
    {{ myCount }}
  </div>
  <a href="#" @click.prevent="dec()" class="ct-btn-tool"><i class="fa-solid fa-minus"></i></a>
  <a href="#" @click.prevent="inc()" class="ct-btn-tool"><i class="fa-solid fa-plus"></i></a>
  <a href="#" @click.prevent="$emit('menu')" class="ct-btn-tool"><i class="fa-solid fa-ellipsis-vertical"></i></a>
</div>
</template>

<style scoped>

.ct {
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: left;
}

.ct-val {
  font-size: 16px;
  line-height: 1;
  padding: 8px 8px;
  text-align: center;
  min-width: 32px;
  height: 32px;
}

.ct-title {
  flex: 1 0 auto;
  padding: 10px;
  border: none;
  line-height: 22px;
}
.ct-title:focus {
  outline: none;
}
</style>