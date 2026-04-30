<script setup>import { ref } from 'vue';
import { useGiftsStore } from '@/stores/gifts';
const props = defineProps({
 bookId: {
 type: String,
 required: true
 },
 chapterId: {
 type: String,
 default: null
 },
 show: {
 type: Boolean,
 default: false
 }
});
const emit = defineEmits(['close', 'sent']);
const giftsStore = useGiftsStore();
const selectedGift = ref(null);
const message = ref('');
const isSending = ref(false);
const showSuccess = ref(false);
function selectGift(gift) {
 selectedGift.value = gift;
}
async function sendGift() {
 if (!selectedGift.value)
 return;
 isSending.value = true;
 await new Promise(resolve => setTimeout(resolve, 500));
 giftsStore.sendGift(props.bookId, props.chapterId, selectedGift.value, message.value);
 isSending.value = false;
 showSuccess.value = true;
 emit('sent', selectedGift.value);
 setTimeout(() => {
 showSuccess.value = false;
 selectedGift.value = null;
 message.value = '';
 emit('close');
 }, 1500);
}
function close() {
 if (!isSending.value) {
 emit('close');
 }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="close">
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="translate-y-full sm:translate-y-4 sm:opacity-0 sm:scale-95"
          enter-to-class="translate-y-0 sm:opacity-100 sm:scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="translate-y-0 sm:opacity-100 sm:scale-100"
          leave-to-class="translate-y-full sm:translate-y-4 sm:opacity-0 sm:scale-95"
        >
          <div v-if="show" class="w-full sm:w-96 bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden">
            <div v-if="showSuccess" class="flex flex-col items-center justify-center py-12 px-6">
              <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 gift-float">
                <span class="text-4xl" v-if="selectedGift">{{ selectedGift.emoji }}</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">礼物发送成功！</h3>
              <p class="text-gray-500 text-sm">感谢您的支持~</p>
            </div>

            <div v-else>
              <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-800">送个礼物</h3>
                <button 
                  @click="close"
                  class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div class="p-6">
                <p class="text-sm text-gray-500 mb-4">选择一个礼物送给作者吧~</p>
                
                <div class="grid grid-cols-4 gap-3 mb-6">
                  <button
                    v-for="gift in giftsStore.giftTypes"
                    :key="gift.id"
                    @click="selectGift(gift)"
                    class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200"
                    :class="selectedGift?.id === gift.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'"
                  >
                    <span class="text-2xl mb-1">{{ gift.emoji }}</span>
                    <span class="text-xs font-medium text-gray-700">{{ gift.name }}</span>
                    <span class="text-xs text-gray-400 mt-0.5">{{ gift.price }}积分</span>
                  </button>
                </div>

                <div v-if="selectedGift" class="mb-4 p-3 bg-purple-50 rounded-xl">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xl">{{ selectedGift.emoji }}</span>
                    <span class="font-medium text-gray-800">{{ selectedGift.name }}</span>
                  </div>
                  <p class="text-xs text-gray-500">{{ selectedGift.description }}</p>
                </div>

                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 mb-2">留言（可选）</label>
                  <textarea
                    v-model="message"
                    placeholder="说点什么吧..."
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    rows="2"
                  />
                </div>

                <button
                  @click="sendGift"
                  :disabled="!selectedGift || isSending"
                  class="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg v-if="isSending" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>{{ isSending ? '发送中...' : '送出礼物' }}</span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
