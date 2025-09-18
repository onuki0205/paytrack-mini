<template>
  <v-container class="pa-4" style="max-width: 500px;">
    <h1 class="text-h5 mb-4">ローン登録</h1>
    <v-card>
      <v-card-text>
        <v-form @submit.prevent="submitLoan">
          <v-text-field v-model="name" label="ローン名" variant="outlined" required />
          <v-text-field v-model.number="amount" label="返済総額" type="number" variant="outlined" required/>
          <v-text-field v-model.number="firstPayment" label="初回支払額" type="number" variant="outlined" required />
          <v-text-field v-model.number="monthlyPayment" label="毎月の支払額" type="number" variant="outlined" required />
          <v-text-field v-model.number="bonusPayment" label="ボーナス月の支払額" type="number" variant="outlined" />
          <v-select v-model="bonusMonths" label="ボーナス月" multiple outlined :items="[1,2,3,4,5,6,7,8,9,10,11,12]" chips />
          <v-text-field v-model="startDate" label="支払開始日" type="date" variant="outlined" required />
          <v-btn color="primary" class="mt-4" block @click="submitLoan">
            登録する
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { doc, collection, addDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const amount = ref<number | null>(null)
const firstPayment = ref<number | null>(null)
const monthlyPayment = ref<number | null>(null)
const bonusPayment = ref<number | null>(null)
const startDate = ref('')
const paymentFrequency = 'monthly'
const bonusMonths = ref<number[]>([])

const uid = auth.uid



async function submitLoan() {
  if ( amount.value == null || firstPayment.value == null || monthlyPayment.value == null || bonusPayment.value == null || !startDate.value) {
    alert('すべての項目を入力してください');
    return;
  }

  const totalPayments = 1 + Math.ceil((amount.value - firstPayment.value) / monthlyPayment.value);

  const loanDoc = await addDoc(collection(db, 'loans'), {
    uid,
    name: name.value,
    amount: amount.value,
    paidCount: 0,
    paymentFrequency,
    startDate: new Date(startDate.value),
    totalPayments,
    firstPayment: firstPayment.value,
    monthlyPayment: monthlyPayment.value,
    bonusPayment: bonusPayment.value,
    bonusMonths: bonusMonths.value,
  });

  try {
    await createPaymentSchedule(loanDoc.id);

    alert('ローンを登録しました')
    router.push(`/dashboard`);
  } catch (error) {
    console.error('登録エラー:', error)
    alert('登録に失敗しました')
  }
}

async function createPaymentSchedule(loanId: string) {
  const baseDate = new Date(startDate.value);
  let remaining = amount.value ?? 0;
  let i = 0;

  while (remaining > 0) {
    const date = new Date(baseDate);
    date.setMonth(baseDate.getMonth() + i);

    let paymentAmount = i === 0
      ? firstPayment.value ?? 0
      : monthlyPayment.value ?? 0;

    // ボーナス月なら支払額を上書き
    if (bonusMonths.value?.some(month => month === date.getMonth() + 1)) {
      paymentAmount = bonusPayment.value ?? paymentAmount;
    }

    remaining -= paymentAmount;

    await addDoc(collection(db, 'loans', loanId, 'payments'), {
      index: i + 1,
      date: date,
      amount: paymentAmount,
      remaining: Math.max(0, Math.floor(remaining)),
    });

    i++;
  }

  await updateDoc(doc(db, 'loans', loanId), {
    totalPayments: i,
  });
}


</script>