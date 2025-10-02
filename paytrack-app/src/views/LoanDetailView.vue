<template>
  <h1>ローン詳細</h1>
  <div class="loan-detail-view">
    <!-- ローン情報カード -->
    <v-container class="pa-4" style="max-width: 600px;">
      <v-card>
        <v-card-title></v-card-title>
        <v-row>
            <!-- ローン基本情報（loanが取得できている場合のみ表示） -->
            <v-col v-if="loan">
                <div>支払総額: ¥{{ loan.amount.toLocaleString('ja-JP') }}</div>
                <div>支払開始日: {{ formatDate(loan.startDate) }}</div>
                <div>ローン完済予定日: {{ formatDate(finalPaymentDate) }}</div>
                <div>支払回数: {{ loan.totalPayments }}回</div>
                
            </v-col>

            <!-- 支払い状況（paymentsが存在する場合のみ表示） -->
            <v-col v-if="payments.length">
                <div>次回支払日: {{ formatDate(nextPaymentDate) }}</div>
                <div>次回支払い額: ¥{{ nextPaymentAmount.toLocaleString() }}</div>
                <div>支払残高合計: ¥{{ totalRemainingBalance.toLocaleString() }}</div>
                <div>残り支払回数: {{ remainingPayments }}回</div>
            </v-col>

        </v-row>

        <!-- ダッシュボードに戻るボタン -->
        <router-link :to="`/dashboard`">
          <v-btn color="primary" block>戻る</v-btn>
        </router-link>
      </v-card>
    </v-container>

    <!-- 支払い履歴テーブル -->
    <v-container class="pa-4" style="max-width: 600px;">
      <v-table>
        <thead>
          <tr>
            <th>#</th>
            <th>支払日</th>
            <th>金額</th>
            <th>残高</th>
            <th>状態</th>
          </tr>
        </thead>
        <tbody>
            <!-- 支払い記録をインデックス順に表示 -->
            <tr v-for="payment in payments" :key="payment.index" @click="!payment.isPaid && markAsPaid(payment.id)">
                <td>{{ payment.index }}</td>
                <td>{{ formatDate(payment.date) }}</td>
                <td>¥{{ payment.amount.toLocaleString() }}</td>
                <td>¥{{ payment.remaining.toLocaleString() }}</td>
                <td>{{ payment.isPaid ? '支払済' : '未払い' }}</td>
            </tr>
        </tbody>
      </v-table>
    </v-container>
  </div>
</template>

<script setup lang="ts">
// Vueの基本機能とFirebase、ルーティングをインポート
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase'
import { updateDoc, doc, collection, getDoc, getDocs } from 'firebase/firestore'
import { useRoute } from 'vue-router'

// URLパラメータからloanIdを取得
const router = useRoute()
const loanId = router.params.id as string

// ローン情報の型定義
interface Loan {
  id: string
  name: string
  amount: number
  firstPayment: number
  monthlyPayment: number
  paymentDay: number
  startDate: any
  totalPayments: number
  paidCount: number
}

// 支払い記録の型定義
interface PaymentRecord {
    id: string
    index: number
    date: any
    amount: number
    remaining: number
    isPaid: boolean
}

// Firestoreから取得したデータを格納するref
const loan = ref<Loan | null>(null)
const payments = ref<PaymentRecord[]>([])

// 次回支払日（今日より後の支払記録のうち最初のもの）
const nextPaymentDate = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return payments.value.find(p => p.date.toDate() > today)?.date ?? null
})

// 次回支払額（今日より後の支払記録のうち最初のものの金額）
const nextPaymentAmount = computed(() => {
  const next = payments.value.find(p => p.date.toDate() > new Date())
  return next?.amount ?? 0
})


// 残り支払回数
const remainingPayments = computed(() => {
  return payments.value.filter(p => !p.isPaid).length
})

// 最終支払日（支払い記録の最後のもの）
const finalPaymentDate = computed(() => {
  const arr = payments.value
  return arr.length > 0 ? arr[arr.length - 1].date : null
})

// 支払残高合計
const totalRemainingBalance = computed(() => {
  const now = new Date()

  const nextUnpaid = payments.value
    .filter(p => !p.isPaid && p.date.toDate() > now)
    .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime())[0]

  return nextUnpaid?.remaining ?? 0
})

// Firestoreからローン情報と支払い記録を取得
onMounted(async () => {
  const loanSnap = await getDoc(doc(db, 'loans', loanId))
  if (loanSnap.exists()) {
    loan.value = loanSnap.data() as Loan
  }

  const paymentSnap = await getDocs(collection(db, 'loans', loanId, 'payments'))
  payments.value = paymentSnap.docs
    .map(doc => {
      const data = doc.data() as PaymentRecord
      // Remove 'id' from data if it exists to avoid overwriting
      const { id, ...rest } = data
      return {
        id: doc.id,
        ...rest,
      }
    })
    .sort((a, b) => a.index - b.index) // インデックス順に並び替え
})

// FirestoreのTimestampを日本語日付に変換
const formatDate = (timestamp: any) => {
  return timestamp?.toDate().toLocaleDateString('ja-JP')
}

async function markAsPaid(paymentId: string) {
  if (!loanId || !paymentId) return

  try {
    await updateDoc(doc(db, 'loans', loanId, 'payments', paymentId), {
      isPaid: true,
    })

    // ローカル状態も更新（即時反映）
    const target = payments.value.find(p => p.id === paymentId)
    if (target) target.isPaid = true
  } catch (error) {
    console.error('支払済み更新エラー:', error)
    alert('更新に失敗しました')
  }
}

</script>