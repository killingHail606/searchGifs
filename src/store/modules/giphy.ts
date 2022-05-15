import axios from 'axios';
import { Plugin } from 'vuex';
import { StoreState } from '@/store';
import { GiphyGetResponseRandom, GiphyGetResponseWithPagination, GiphyModule } from '@/types/store/giphy';

export const actions: GiphyModule['actions'] = {
  async getRandomGifUrl(): Promise<string> {
    const res = await axios.get<GiphyGetResponseRandom>('https://api.giphy.com/v1/gifs/random', {
      params: {
        api_key: import.meta.env.VITE_GIPHY_API,
      },
    });

    return res.data.data.images.fixed_width.url;
  },
  async getTrendingGifs(_, {
    page = 1, gifsPerPage = 32,
  }): Promise<GiphyGetResponseWithPagination> {
    const res = await axios.get<GiphyGetResponseWithPagination>('https://api.giphy.com/v1/gifs/trending', {
      params: {
        api_key: import.meta.env.VITE_GIPHY_API,
        limit: gifsPerPage,
        offset: (page - 1) * gifsPerPage,
      },
    });

    return res.data;
  },
  async getSearchedGifs(_, { page = 1, gifsPerPage = 32, searchString = '' }): Promise<GiphyGetResponseWithPagination> {
    const res = await axios.get<GiphyGetResponseWithPagination>('https://api.giphy.com/v1/gifs/search', {
      params: {
        api_key: import.meta.env.VITE_GIPHY_API,
        limit: gifsPerPage,
        q: searchString,
        offset: (page - 1) * gifsPerPage,
      },
    });

    return res.data;
  },
};

export const plugins: Array<Plugin<StoreState>> = [];
