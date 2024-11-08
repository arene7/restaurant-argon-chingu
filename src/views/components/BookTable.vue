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

// Fetch orders from Firebase Firestore and filter by today's date
const fetchOrders = async () => {
    const db = getFirestore();
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);
    
    // Get today's date in local timezone, removing time information
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight to compare only the date
    
    orders.value = querySnapshot.docs
        .map(doc => {
            const data = { id: doc.id, ...doc.data() };
            if (data.createdAt) {
                const orderDate = data.createdAt.toDate();
                orderDate.setHours(0, 0, 0, 0);
                // Compare the date part only to check if it's today
                if (orderDate.getTime() === today.getTime()) {
                    return data;
                }
            }
            return null;
        })
        .filter(order => order !== null); // Filter out null entries
    
    console.log(orders.value); // Verify orders list
};

onMounted(fetchOrders);
</script>

<style scoped>
/* Puedes añadir estilos personalizados aquí si es necesario */
</style>
