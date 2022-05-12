<script lang='ts' setup>
import { onMounted, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import axios from 'axios';
import HeaderBlock from '@/components/HeaderBlock.vue';
import { GiphyGetResponseData, GiphyGetResponseRandom, GiphyGetResponseWithPagination } from '@/types/store/giphy';
import { Gif } from '@/types/main_types';

import loading from '@/assets/loading.gif';

const { name } = useDisplay();

function getCountImageBlocks(): number {
  let countImageBlocks = 4;

  if (name.value === 'md') {
    countImageBlocks = 3;
  } else if (name.value === 'sm') {
    countImageBlocks = 2;
  } else if (name.value === 'xs') {
    countImageBlocks = 1;
  }

  return countImageBlocks;
}

async function getRandomGifUrl(): Promise<string> {
  const res = await axios.get<GiphyGetResponseRandom>('https://api.giphy.com/v1/gifs/random', {
    params: {
      api_key: import.meta.env.VITE_GIPHY_API,
    },
  });
  return res.data.data.images.fixed_width.url;
}

const countImageBlocks = getCountImageBlocks();

const lastPage = ref(Infinity);
const page = ref(1);
const gifsPerPage = 32;

const searchString = ref<string>('');
const isLoadingImages = ref(false);

const isNotFound = ref(false);
const isNotFoundImage = ref<string>('');

const trendingImages = ref<GiphyGetResponseData[]>([]);
const searchedImages = ref<GiphyGetResponseData[]>([]);

function getRowImages() {
  isNotFound.value = false;
  if (searchedImages.value.length > 0) {
    return searchedImages.value;
  } if (searchString.value.length > 0) {
    isNotFound.value = true;
    getRandomGifUrl().then((url) => {
      isNotFoundImage.value = url;
    });
    return [];
  }
  return trendingImages.value;
}

const imagesInBlocks = ref<Gif[][]>([]);

async function getTrendingGifs(loadMore = false): Promise<void> {
  isLoadingImages.value = true;

  const res = await axios.get<GiphyGetResponseWithPagination>('https://api.giphy.com/v1/gifs/trending', {
    params: {
      api_key: import.meta.env.VITE_GIPHY_API,
      limit: gifsPerPage,
      offset: (page.value - 1) * gifsPerPage,
    },
  });

  lastPage.value = Math.ceil(res.data.pagination.total_count / gifsPerPage);
  trendingImages.value = loadMore ? [...trendingImages.value, ...res.data.data] : res.data.data;
  isLoadingImages.value = false;
}

async function getSearchedGifs(loadMore = false): Promise<void> {
  isLoadingImages.value = true;

  const res = await axios.get<GiphyGetResponseWithPagination>('https://api.giphy.com/v1/gifs/search', {
    params: {
      api_key: import.meta.env.VITE_GIPHY_API,
      limit: gifsPerPage,
      q: searchString.value,
      offset: (page.value - 1) * gifsPerPage,
    },
  });

  lastPage.value = Math.ceil(res.data.pagination.total_count / gifsPerPage);
  searchedImages.value = loadMore ? [...searchedImages.value, ...res.data.data] : res.data.data;
  isLoadingImages.value = false;
}

function setSearchString(value: string) {
  searchString.value = value;
}

function getBlockWithMinHeight(countImageBlocks: number, images: Gif[][]): number {
  let minHeight = Infinity;
  let minHeightBlock = 0;
  for (let i = 0; i < countImageBlocks; i++) {
    const heightBlock = images[i] ? images[i].reduce((acc, curr) => acc + curr.height, 0) : 0;
    if (heightBlock < minHeight) {
      minHeight = heightBlock;
      minHeightBlock = i;
    }
  }
  return minHeightBlock;
}

function divideGifsIntoBlocks(gifsRefs: GiphyGetResponseData[]): void {
  const lastGifsRefs = gifsRefs.slice(-gifsPerPage);
  const pictures: Gif[] = [];

  lastGifsRefs.forEach((gifObj) => {
    pictures.push({
      title: gifObj.title,
      url: gifObj.images.fixed_width.url,
      height: Number(gifObj.images.fixed_width.height),
      width: Number(gifObj.images.fixed_width.width),
    });
  });

  pictures.forEach((picture) => {
    const blockIndex = getBlockWithMinHeight(countImageBlocks, imagesInBlocks.value);
    if (imagesInBlocks.value[blockIndex]) {
      imagesInBlocks.value[blockIndex].push(picture);
    } else {
      imagesInBlocks.value[blockIndex] = [picture];
    }
  });
}

async function shareGif(gif: Gif): Promise<void> {
  navigator.share({
    title: 'Gif',
    text: gif.title,
    url: gif.url,
  })
    .then(() => {
      console.log('Successfully shared');
    })
    .catch(() => {
      console.log('Share failed');
    });
}

watch(searchString, async (value) => {
  page.value = 1;
  imagesInBlocks.value = [];
  if (value.length > 0) {
    await getSearchedGifs();
  } else {
    searchedImages.value = [];
  }
});

watch(() => getRowImages(), (value) => {
  divideGifsIntoBlocks(value);
});

let loadingMore = false;
onMounted(async () => {
  await getTrendingGifs();
  divideGifsIntoBlocks(trendingImages.value);

  window.onscroll = async () => {
    const userPositionScroll = document.documentElement.scrollTop + window.innerHeight;
    const bottomOfWindow = document.documentElement.offsetHeight - (userPositionScroll) < 150;

    if (bottomOfWindow && !isLoadingImages.value && !loadingMore && page.value < lastPage.value) {
      loadingMore = true;
      setTimeout(() => {
        loadingMore = false;
      }, 500);
      page.value++;

      if (searchedImages.value.length > 0) {
        await getSearchedGifs(true);
      } else {
        await getTrendingGifs(true);
      }
    }
  };
});
</script>

<template>
  <v-layout>
    <HeaderBlock @search="setSearchString" />
    <v-main>
      <v-container fluid>
        <v-row :dense="true">
          <v-col
            cols="12"
            lg="3"
            md="4"
            sm="6"
          >
            <v-col
              v-for="image in imagesInBlocks[0]"
              :key="image.url"
              cols="12"
            >
              <v-card
                class="gif-image"
                @click="shareGif(image)"
              >
                <v-img
                  :src="image.url"
                  class="gif-image"
                />
              </v-card>
            </v-col>
          </v-col>
          <v-col
            cols="12"
            lg="3"
            md="4"
            sm="6"
          >
            <v-col
              v-for="image in imagesInBlocks[1]"
              :key="image.url"
              cols="12"
            >
              <v-card
                class="gif-image"
                @click="shareGif(image)"
              >
                <v-img
                  :src="image.url"
                  class="gif-image"
                />
              </v-card>
            </v-col>
          </v-col>
          <v-col
            v-if="name === 'md' || name === 'lg' || name === 'xl'"
            cols="12"
            lg="3"
            md="4"
          >
            <v-col
              v-for="image in imagesInBlocks[2]"
              :key="image.url"
              cols="12"
            >
              <v-card
                class="gif-image"
                @click="shareGif(image)"
              >
                <v-img
                  :src="image.url"
                  class="gif-image"
                />
              </v-card>
            </v-col>
          </v-col>
          <v-col
            v-if="name === 'lg' || name === 'xl'"
            cols="3"
          >
            <v-col
              v-for="image in imagesInBlocks[3]"
              :key="image.url"
              cols="12"
            >
              <v-card
                class="gif-image"
                @click="shareGif(image)"
              >
                <v-img
                  :src="image.url"
                  class="gif-image"
                />
              </v-card>
            </v-col>
          </v-col>
        </v-row>

        <v-row v-if="!isNotFound && page < lastPage">
          <v-img
            width="150"
            height="150"
            :src="loading"
            class="loading-image"
          />
        </v-row>

        <v-row v-if="isNotFound && !isLoadingImages">
          <v-col cols="12">
            <p class="text-center text-h3">
              Nothing found, try changing your search term
            </p>
            <v-img
              :src="isNotFoundImage"
              class="not-found-image"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-layout>
</template>

<style lang='scss' scoped>
.loading-image {
  margin: 30px 0;
}

.gif-image {
  border-radius: 10px;
  position: relative;

  &::after {
    content: 'Share Gif';
    color: white;
    font-size: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover::after {
    opacity: 1;
  }
}

.not-found-image {
  margin: 20px auto;
  width: 400px;
  border-radius: 10px;
}
</style>
