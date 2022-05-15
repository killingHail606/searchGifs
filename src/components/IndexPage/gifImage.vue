<script lang='ts' setup>
import { PropType } from 'vue';
import { Gif } from '@/types/main_types';

defineProps({
  image: Object as PropType<Gif>,
});

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
</script>

<template>
  <v-card
    class="wrapper-gif-image"
    @click="shareGif(image)"
  >
    <v-img
      :src="image.url"
      class="gif-image"
    />
  </v-card>
</template>

<style lang='scss' scoped>
.wrapper-gif-image {
  border-radius: 10px;

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
}
</style>
