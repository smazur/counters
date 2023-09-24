<script>
import Counter from "./Counter.vue";
import Datepicker from "./Datepicker.vue";

export default {
  name: "AppScreen",
  props: ['showHeader', 'showFooter', 'showSidebar'],
  components: {Datepicker, Counter},

  data() {
    return {
      sidebarOpen: false,
    };
  },

  methods: {
    openSidebar() {
      this.sidebarOpen = true;
    },

    closeSidebar() {
      this.sidebarOpen = false;
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
  }

}
</script>

<template>
  <div class="ct-app fl-col">
    <div class="ct-app-body fl-col fl-grow">
      <div v-if="showHeader" class="ct-header ct-shadow-down fl-row fl-gap-1 ph1" style="position:relative; z-index: 2;align-items: center">
        <div v-if="showSidebar" style="flex:0">
          <a href="#" class="ct-btn-tool" @click.prevent="toggleSidebar()">
            <i class="fa-solid fa-bars"></i>
          </a>
        </div>
        <slot name="header"></slot>
      </div>

      <div class="ct-body fl-grow-scroll-y" style="position:relative;z-index:1">
        <slot></slot>
      </div>

      <div v-if="showFooter" class="ct-footer ct-shadow-up" style="position: relative;z-index: 2">
        <slot name="footer"></slot>
      </div>
    </div>

    <div v-if="showSidebar" class="ct-sidebar" :class="{'ct-sidebar-open': sidebarOpen}" @click.self="toggleSidebar()">
      <div class="ct-sidebar-body">
        <slot name="sidebar"></slot>
      </div>
    </div>
  </div>
</template>