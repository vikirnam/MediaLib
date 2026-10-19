import {svelte} from '@sveltejs/vite-plugin-svelte'
export default {plugins:[svelte()],base:'./',build:{outDir:'docs',emptyOutDir:true,rollupOptions:{output:{format:'iife'}}}}
