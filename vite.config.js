import {svelte} from '@sveltejs/vite-plugin-svelte'
export default {plugins:[svelte()],base:'./',build:{outDir:'dist',emptyOutDir:true,rollupOptions:{output:{format:'iife'}}}}
