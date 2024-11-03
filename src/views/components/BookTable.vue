<template>
    <timeline-list title="Order Timeline">
        <timeline-item
            v-for="order in orders"
            :key="order.id"
            :icon="{ component: 'ni ni-cart', color: 'info' }"
            :title="`Order ID: ${order.id}`"
            :date-time="order.createdAt ? order.createdAt.toDate().toLocaleString() : 'Invalid Date'"
            :description="`Reservation ID: ${order.reservationId}`"
            :badges="order.items.map(item => item.name + ' (x' + item.quantity + ')')"
        />
    </timeline-list>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import TimelineList from "@/examples/Cards/TimelineList.vue";
import TimelineItem from "@/examples/Cards/TimelineItem.vue";

const orders = ref([]);

// Fetch orders from Firebase Firestore
const fetchOrders = async () => {
    const db = getFirestore();
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);
    orders.value = querySnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        console.log(data); // Verifica la estructura del objeto
        return data;
    });
};

onMounted(fetchOrders);
</script>

<style scoped>
/* Puedes añadir estilos personalizados aquí si es necesario */
</style>
