<template>
    <h1>ローン詳細</h1>
    <div class="loan-detail-view">
        <v-container class="pa-4" style="max-width: 600px;">
        <v-card>
            <v-card-title></v-card-title>
            <v-row>
                <v-col>
                        <div>支払総額: ¥{{ loan.amount.toLocaleString('ja-JP') }}</div>
                        <div>支払開始日: {{ formatDate(loan.startDate) }}</div>
                        <div>初支払額: ¥{{ loan.firstPayment.toLocaleString('ja-JP') }}</div>
                        <div>総支払回数: {{ loan.totalPayments }}回</div>
                </v-col>
                <v-col>
                    <v-text-field  v-if="payments" align-center>
                        <div >次回支払日: {{  }}</div>
                        <div>残り支払回数: {{  }}</div>
                        <div>ローン完済予定日: {{  }}</div>
                    </v-text-field>
                </v-col>
            </v-row>
            <router-link :to="`/dashboard`">
                <v-btn color="primary" block>戻る</v-btn>
            </router-link>
        </v-card>
        </v-container>
        <v-container class="pa-4" style="max-width: 600px;">
            <v-table>
                <thead>
                <tr>
                    <th></th>
                    <th>支払日</th>
                    <th>金額</th>
                    <th>残高</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="payment in payments" :key="payment.index">
                    <td>{{ payment.index }}</td>
                    <td>{{ formatDate(payment.date) }}</td>
                    <td>¥{{ payment.amount.toLocaleString() }}</td>
                    <td>¥{{ payment.remaining.toLocaleString() }}</td>
                </tr>
                </tbody>
            </v-table>
        </v-container>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '@/firebase';
import { doc, collection, getDoc, getDocs } from 'firebase/firestore';
import { useRoute } from 'vue-router';

const router = useRoute();
const loanId = router.params.id as string;

interface Loan {
    id: string;
    name: string;
    amount: number;
    firstPayment: number;
    monthlyPayment: number;
    paymentDay: number;
    startDate: any;
    totalPayments: number;
    paidCount: number;
}
interface PaymentRecord {
    index: number;
    date: any;
    amount: number;
    remaining: number;
}
const loan = ref<any>(null);
const payments = ref<PaymentRecord[]>([]);

onMounted(async () => {
    const loanSnap = await getDoc(doc(db, 'loans', loanId));
    if (loanSnap.exists()) {
        loan.value = loanSnap.data() as Loan;
    }

    const paymentSnap = await getDocs(collection(db, 'loans', loanId, 'payments'));
    payments.value = paymentSnap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as PaymentRecord),
    })).sort((a, b) => a.index - b.index);
});

const formatDate = (timestamp: any) => {
    return timestamp?.toDate().toLocaleDateString('ja-JP');
};

</script>