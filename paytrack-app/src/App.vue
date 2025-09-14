<template>
  <v-app class="v-application light-green-bg">
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>PayTrack Mini</v-toolbar-title>
      
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-footer app color="grey-lighten-1">
      <span class="mx-auto">© 2025 PayTrack Mini</span>
    </v-footer>
  </v-app>
</template>

<style scoped>
.light-green-bg {
  background-color: #e0f7e9; /* ライトグリーン系 */
  min-height: 100vh;
}
.v-application {
  background-color: #f5f5f5; /* 明るいグレー系 */
}
</style>
