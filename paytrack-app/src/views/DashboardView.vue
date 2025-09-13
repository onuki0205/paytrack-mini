<template>
    <div class="dashboard">
        <h1>Dashboard</h1>
        <p>Welcome to the PayTrack dashboard!</p>
        <!-- Add more dashboard content here -->
        <v-container v-if="loading">読み込み中...</v-container>
        <v-container v-else-if="userData">
            <h1 class="text-h5">ようこそ、{{ userData.name }} さん</h1>
            <p>メール: {{ userData.email }}</p>
            <p>登録日: {{ userData.createdAt.toDate().toLocaleString() }}</p>
        </v-container>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase' // ← Firestoreインスタンス
import { Timestamp } from 'firebase/firestore'

interface UserData {
  name: string
  email: string
  createdAt: Timestamp
}


const props = defineProps<{ uid: string }>()
const uid = props.uid
const userData = ref<UserData | null>(null)
const loading = ref(true)

onMounted(async () => {
  console.log('uid:', uid)

  const docRef = doc(db, 'users', uid)
  const docSnap = await getDoc(docRef)

  console.log('docSnap.exists():', docSnap.exists())

  if (docSnap.exists()) {
    const data = docSnap.data()
    console.log('userData:', data)
    userData.value = {
      name: data.name,
      email: data.email,
      createdAt: data.createdAt?.toDate?.() || new Date(),
    }
  } else {
    console.warn('ユーザーデータが存在しません')
  }

  loading.value = false
})
</script>