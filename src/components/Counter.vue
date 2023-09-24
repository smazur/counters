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
    focusTitle() {
      this.$refs.title.focus();
    },

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
    <input type="number" v-model="myCount">
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
  min-width: 60px;
  max-width: 60px;
  width: 60px;
}

.ct-val>input {
  font-size: 16px;
  line-height: 22px;
  padding: 10px 0;
  text-align: center;
  width: 100%;
  background-color: #F5F5F5;
  border: none;
}
.ct-val>input:focus {
  outline: none;
  background-color: #DDD;
}

.ct-val>input::-webkit-outer-spin-button,
.ct-val>input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.ct-val>input[type=number] {
  -moz-appearance: textfield;
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