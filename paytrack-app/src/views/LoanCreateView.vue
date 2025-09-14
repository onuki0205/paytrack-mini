<template>
  <v-container class="pa-4" style="max-width: 500px;">
    <h1 class="text-h5 mb-4">ローン登録</h1>

    <v-form @submit.prevent="submitLoan">
      <v-text-field
        v-model="name"
        label="ローン名"
        required
        variant="outlined"
        density="compact"
      />
      <v-text-field
        v-model.number="amount"
        label="金額（¥）"
        type="number"
        required
        variant="outlined"
        density="compact"
      />
      <v-text-field
        v-model.number="totalPayments"
        label="総支払い回数"
        type="number"
        required
        variant="outlined"
        density="compact"
      />
      <v-text-field
        v-model="startDate"
        label="開始日"
        type="date"
        required
        variant="outlined"
        density="compact"
      />

      <v-btn color="primary" class="mt-4" block @click="submitLoan">
        登録する
      </v-btn>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

const name = ref('')
const amount = ref<number | null>(null)
const totalPayments = ref<number | null>(null)
const startDate = ref('')
const router = useRouter()
const auth = useAuthStore()
const uid = auth.uid




const submitLoan = async () => {
  if (!name.value || !amount.value || !totalPayments.value || !startDate.value) {
    alert('すべての項目を入力してください')
    return
  }

  try {
    await addDoc(collection(db, 'loans'), {
      uid,
      name: name.value,
      amount: amount.value,
      paidCount: 0,
      paymentFrequency: 'monthly',
      startDate: Timestamp.fromDate(new Date(startDate.value)),
      totalPayments: totalPayments.value,
    })

    alert('ローンを登録しました')
    router.push('/dashboard')
  } catch (error) {
    console.error('登録エラー:', error)
    alert('登録に失敗しました')
  }
}
</script>