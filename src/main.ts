import { mount } from 'svelte';
import App from './App.svelte'

import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'

const app = mount(App, { target: document.body! });

export default app
