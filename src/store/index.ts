import { createStore } from 'vuex';
import { GiphyModule } from '@/types/store/giphy';
import * as giphy from '@/store/modules/giphy';

export interface StoreState {
  giphy: GiphyModule;
}

const store = createStore<StoreState>({
  modules: {
    giphy,
  },
  plugins: [
    ...giphy.plugins,
  ],
});

export {
  store,
};
