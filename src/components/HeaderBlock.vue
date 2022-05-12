<script lang='ts' setup>
import { ref, watch } from 'vue';

const emit = defineEmits(['search']);

const search = ref<string>();
const maxLength = ref<number>(50);
const rules = [(v: string) => v.length <= maxLength.value || `Max ${maxLength.value} characters`];

let lastTypingTime = new Date().getTime();

watch(search, (query) => {
  // Заддержка ввода, чтобы не отправлять запрос при каждом нажатии клавиши
  lastTypingTime = new Date().getTime();
  setTimeout(() => {
    if (new Date().getTime() - lastTypingTime >= 2000) {
      emit('search', query);
    }
  }, 2000);
});
</script>

<template>
  <v-app-bar
    color="teal-darken-4"
    height="65"
    image="https://picsum.photos/1920/1080?random"
  >
    <template #image>
      <v-img
        gradient="to top right, rgba(19,84,122,.6), rgba(128,208,199,.6)"
      />
    </template>

    <v-app-bar-title
      class="title-block"
    >
      <p>
        Search gifs
      </p>
      <p class="text-caption">
        Powered by GIPHY
      </p>
    </v-app-bar-title>

    <v-spacer />

    <v-text-field
      v-model.trim="search"
      :rules="rules"
      :maxlength="maxLength"
      hint="This field uses maxlength attribute"
      density="compact"
      label="Search gifs"
      hide-details="true"
      :counter="true"
      class="search-field"
    />
  </v-app-bar>
</template>

<style lang='scss' scoped>
.title-block {
  min-width: 145px;
}

.search-field {
  min-width: 140px;
}
</style>
