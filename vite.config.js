import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({build:{sourcemap:false,rollupOptions:{input:Object.fromEntries(['lab','index','x1','contact','journal','post','research','dispatch','unsubscribe','studio','support','privacy','terms'].map(name=>[name,resolve(import.meta.dirname,`${name}.html`)]))}}});
