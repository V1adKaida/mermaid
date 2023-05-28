<script setup>
import { RouterView, useRoute } from 'vue-router'
import Header from '@/components/layout/Header.vue'
</script>

<template>
  <Header v-if="useRoute().name != 'auth'" />
  <RouterView />
</template>

<style lang="scss" scoped></style>
