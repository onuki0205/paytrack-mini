<template>
    <div class="dashboard">
        <h1>Landing Page</h1>
        <p>Welcome to the app</p>
        <!-- Add more dashboard content here -->
        <v-container>
            <v-text-field v-model="email" label="Email" />
            <v-text-field v-model="password" label="Password" type="password" />
            <v-btn @click="login">ログイン</v-btn>
        </v-container>

    </div>
</template>


<script setup>
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()


const login = async () => {
  try {
    const result = await signInWithEmailAndPassword(auth, email.value, password.value)
    const uid = result.user.uid
    alert('ログイン成功: ' + uid)
    
    router.push(`/dashboard/${uid}`)
  } catch (error) {
    alert('ログイン失敗: ' + error.message)
  }
}
</script>

