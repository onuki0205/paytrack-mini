// stores/auth.ts
import { defineStore } from 'pinia'
import { auth } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'

import type { User } from 'firebase/auth'

// stores/auth.ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
  }),
  getters: {
    uid: (state) => state.user?.uid || '',
    isLoggedIn: (state) => !!state.user?.uid || '',
  },
  actions: {
    init() {
      onAuthStateChanged(auth, (user) => {
        this.user = user
      })
    },
  },
})
