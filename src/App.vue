<template>
  <!-- <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav> -->
  <router-view />
</template>

<style>
:root {
  /*
     "Canvas" becomes the following 👇
     
     Light system preferences:
       - Chrome: #fff
       - Safari: #fff
     Dark system preferences: 
       - Chrome: #000
       - Safari: #1e1e1e
  */
  background-color: Canvas;
  /* 
     "CanvasText" becomes the following 👇

     Light system preferences:
       - Chrome: #000
       - Safari: #000
     Dark system preferences: 
       - Chrome: #fff
       - Safari: #fff
  */
  color: CanvasText;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui,
    helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html,
body,
#app {
  height: 100%;
}

body {
  margin: 0;
  padding: 0.5em;
  box-sizing: border-box;
  position: relative;
}

/* * {
  user-select: none;
} */
</style>
