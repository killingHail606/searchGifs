import { Plugin } from 'vuex';
import { StoreState } from '@/store';
import { GiphyModule } from '@/types/store/giphy';

export const state: GiphyModule['state'] = () => ({})

export const getters: GiphyModule['getters'] = {};

export const mutations: GiphyModule['mutations'] = {};

export const actions: GiphyModule['actions'] = {};

export const plugins: Array<Plugin<StoreState>> = [];
