<template>
  <!-- ローン登録フォームのコンテナ -->
  <v-container class="pa-4" style="max-width: 500px;">
    <h1 class="text-h5 mb-4">ローン登録</h1>
    <v-card>
      <v-card-text>
        <!-- フォーム送信時に submitLoan を呼び出す -->
        <v-form @submit.prevent="submitLoan">
          <!-- ローン名の入力 -->
          <v-text-field v-model="name" label="ローン名" variant="outlined" required />

          <!-- 返済総額の入力 -->
          <v-text-field v-model.number="amount" label="返済総額" type="number" variant="outlined" required />

          <!-- 初回支払額の入力 -->
          <v-text-field v-model.number="firstPayment" label="初回支払額" type="number" variant="outlined" required />

          <!-- 毎月の支払額の入力 -->
          <v-text-field v-model.number="monthlyPayment" label="毎月の支払額" type="number" variant="outlined" required />

          <!-- ボーナス月の支払額（任意） -->
          <v-text-field v-model.number="bonusPayment" label="ボーナス月の支払額" type="number" variant="outlined" />

          <!-- ボーナス月の選択（複数可） -->
          <v-select v-model="bonusMonths" label="ボーナス月" multiple outlined :items="monthOptions" chips />

          <!-- 支払開始日の入力 -->
          <v-text-field v-model="startDate" label="支払開始日" type="date" variant="outlined" required />

          <!-- 登録ボタン -->
          <v-btn color="primary" class="mt-4" block type="submit">
            登録する
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>

</template>

<script setup lang="ts">
// 必要なモジュールのインポート
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { doc, collection, addDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { auth as firebaseAuth } from '@/firebase'

// ルーターと認証ストア
const router = useRouter()


// 入力項目
const name = ref('')
const amount = ref<number | null>(null)
const firstPayment = ref<number | null>(null)
const monthlyPayment = ref<number | null>(null)
const bonusPayment = ref<number | null>(null)
const startDate = ref('')
const bonusMonths = ref<number[]>([])
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

// 認証済み UID（onAuthStateChanged で取得）
const uid = ref<string | null>(null)
onMounted(() => {
  onAuthStateChanged(firebaseAuth, (user) => {
    if (user) {
      uid.value = user.uid
    }
  })
})

// ローン登録処理
async function submitLoan() {
  if (
    !name.value ||
    amount.value == null ||
    firstPayment.value == null ||
    monthlyPayment.value == null ||
    !startDate.value ||
    (bonusMonths.value.length > 0 && bonusPayment.value == null)
  ) {
    alert('すべての項目を入力してください')
    return
  }

  if (!uid.value) {
    alert('ログイン情報が取得できませんでした')
    return
  }

  // ローン本体を登録
  const loanDoc = await addDoc(collection(db, 'loans'), {
    uid: uid.value,
    name: name.value,
    amount: amount.value,
    paidCount: 0,
    paymentFrequency: 'monthly',
    startDate: new Date(startDate.value),
    firstPayment: firstPayment.value,
    monthlyPayment: monthlyPayment.value,
    bonusPayment: bonusPayment.value,
    bonusMonths: bonusMonths.value,
  })

  try {
    // 支払いスケジュールを作成し、支払い回数を取得
    const totalPayments = await createPaymentSchedule(loanDoc.id)

    // ローンに支払い回数を更新
    await updateDoc(doc(db, 'loans', loanDoc.id), { totalPayments })

    alert('ローンを登録しました')
    router.push('/dashboard')
  } catch (error) {
    console.error('登録エラー:', error)
    alert('登録に失敗しました')
  }
}

// 支払いスケジュールの作成（writeBatch による一括登録）
async function createPaymentSchedule(loanId: string): Promise<number> {
  const baseDate = new Date(startDate.value)
  const day = baseDate.getDate() // 支払開始日の「日」部分を保持
  let remaining = amount.value ?? 0
  let i = 0

  const batch = writeBatch(db)

  while (remaining > 0) {
    // 支払開始日の「日」を維持したまま月を進める
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, day)

    let paymentAmount = i === 0
      ? firstPayment.value ?? 0
      : monthlyPayment.value ?? 0

    const bonusMonthSet = new Set(bonusMonths.value);
    if (bonusMonthSet.has(date.getMonth() + 1)) {
      paymentAmount = bonusPayment.value ?? paymentAmount;
    }

    remaining -= paymentAmount

    const paymentRef = doc(collection(db, 'loans', loanId, 'payments'))

    batch.set(paymentRef, {
      uid: uid.value,
      index: i + 1,
      date: date,
      amount: paymentAmount,
      remaining: Math.max(0, Math.floor(remaining)),
      isBonusMonth: bonusMonthSet.has(date.getMonth() + 1),
      isPaid: false,
    })

    i++
  }

  await batch.commit()
  return i
}

</script>