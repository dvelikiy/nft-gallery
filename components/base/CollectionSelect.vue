<template>
  <div>
    <div
      v-if="showExplainerText && isLogIn"
      class="mb-2"
    >
      <small>
        {{ $t('createNftExplainer') }}
      </small>
    </div>
    <NeoField :label="$t('collection')">
      <template #label>
        <div>{{ $t('collection') }}</div>
        <div class="font-light text-xs mb-3">
          {{ $t('Select collection where do you want mint your token') }}
        </div>
      </template>
      <NeoSelect
        v-model="selectedCollection"
        placeholder="Select a collection"
        expanded
      >
        <option
          disabled
          selected
          value=""
        >
          --
        </option>
        <option
          v-for="option in collections"
          :key="option.id"
          :value="option"
        >
          {{ option.name || option.id }} ({{ option.totalCount }})
        </option>
      </NeoSelect>
    </NeoField>
  </div>
</template>

<script lang="ts" setup>
import { NeoField, NeoSelect } from '@kodadot1/brick'
import type { BaseMintedCollection as MintedCollection } from './types'

const { isLogIn } = useAuth()
const selectedCollection = ref()
const emit = defineEmits(['changeSelectedCollection'])

withDefaults(
  defineProps<{
    collections?: MintedCollection[]
    showExplainerText?: boolean
  }>(),
  {
    collections: () => [],
    showExplainerText: false,
  },
)

watch(selectedCollection, (value) => {
  emit('changeSelectedCollection', value)
})
</script>
