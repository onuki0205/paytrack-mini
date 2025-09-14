<template>
    <div class="dashboard">
      <h1>Landing Page</h1>
      <p>Welcome to the app</p>
      <!-- Add more dashboard content here -->
      <v-container class="pa-4" style="max-width: 400px;">
        <v-form>
          <v-text-field v-model="email" label="Email" density="compact" hide-details variant="outlined"/>
          <v-text-field v-model="password" label="Password" type="password" density="compact" hide-details variant="outlined"/>

          <v-row class="mt-3" justify="space-between">
            <v-col cols="6">
              <v-btn color="primary" @click="login" block>ログイン</v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn color="secondary" @click="signup" block>サインアップ</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </div>
</template>


<script setup>
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/firebase'
import { useRouter } from 'vue-router'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

const email = ref('')
const password = ref('')
const router = useRouter()


const login = async () => {
  try {
    const result = await signInWithEmailAndPassword(auth, email.value, password.value)
    const uid = result.user.uid
    // Firestore にユーザーデータを保存
    await setDoc(doc(db, 'users', uid), {
      uid,
      email: result.user.email,
      name: result.user.displayName || 'No Name',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    })
    
    router.push(`/dashboard`)
  } catch (error) {
    alert('ログイン失敗')
  }
}

const signup = () => {
  alert('サインアップ画面は未実装です')
  // router.push('/signup')
}


</script>

