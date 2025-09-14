<template>
  <div class="dashboard">
    <title>ダッシュボード - PayTrack</title>
    <h1 class="text-h4 mb-4">ダッシュボード</h1>

    <v-container v-if="loading">読み込み中...</v-container>

    <v-container v-else>
      <v-card v-if="userData" class="mb-6 pa-4">
        <h2 class="text-h6">ようこそ、{{ userData.email || 'ユーザー' }} さん</h2>
      </v-card>

      <h2 class="text-h5 mb-4">ローン一覧</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" class="mb-4" @click="router.push('/loan/new')">
          ローン追加
      </v-btn>
      <v-card v-if="loans.length === 0" class="pa-4 mb-6">
        <p>現在、登録されているローンはありません。</p>
      </v-card>
      <v-card v-else class="pa-4 mb-6">
        <p>以下はあなたの登録しているローンの一覧です。各ローンをクリックすると詳細ページに移動します。</p>
      </v-card>
      <v-row>
        <v-col v-for="loan in loans" :key="loan.id" cols="12" sm="6" md="4">
          <v-card @click="goToLoanDetail(loan.id)" class="loan-card" hover>
            <v-card-title>{{ loan.name }}</v-card-title>
            <v-card-subtitle>引落日: {{ formatDate(loan.dueDate) }}</v-card-subtitle>
            <v-card-text>金額: ¥{{ loan.amount.toLocaleString() }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

interface UserData {
  uid: string
  email: string
  name?: string
}

interface Loan {
  id: string
  name: string
  amount: number
  dueDate: any // Firestore Timestamp
}

const userData = ref<UserData | null>(null)
const loans = ref<Loan[]>([])
const loading = ref(true)

const auth = useAuthStore()
const uid = auth.uid
const router = useRouter()

const formatDate = (timestamp: any) => {
  return timestamp?.toDate().toLocaleDateString('ja-JP')
}

const goToLoanDetail = (loanId: string) => {
  router.push(`/loan/${loanId}`)
}

onMounted(async () => {
  try {
    if (!uid) {
      console.warn('UIDが未定義です')
      alert('ログイン情報が取得できませんでした')
      return
    }

    console.log('uid:', uid)

    // ユーザーデータ取得
    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      console.log('userData:', data)
      userData.value = {
        uid: data.uid,
        email: data.email,
        name: data.name ?? 'ユーザー',
      }
    } else {
      console.warn('ユーザーデータが存在しません')
    }

    // ローン一覧取得
    const loanQuery = query(collection(db, 'loans'), where('uid', '==', uid)) // ← Firestore構造に合わせて 'userId' に変更可
    const loanSnap = await getDocs(loanQuery)

    loans.value = loanSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Loan[]

    console.log('取得したローン一覧:', loans.value)

  } catch (error) {
    console.error('Firestore読み込みエラー:', error)
    alert('データの取得に失敗しました')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.loan-card {
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}
.loan-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
