<template>
    <div class="card">
        <div class="card-header pb-0 px-3 text-center">
            <ul class="nav nav-pills justify-content-center" id="pills-tab" role="tablist">
                <li class="nav-item" role="presentation">
                    <a
                        class="nav-link active"
                        id="pills-main-courses-tab"
                        data-bs-toggle="pill"
                        href="#pills-main-courses"
                        role="tab"
                        aria-controls="pills-main-courses"
                        aria-selected="true"
                    >
                        Main Courses
                    </a>
                </li>
                <li class="nav-item" role="presentation">
                    <a
                        class="nav-link"
                        id="pills-appetizers-tab"
                        data-bs-toggle="pill"
                        href="#pills-appetizers"
                        role="tab"
                        aria-controls="pills-appetizers"
                        aria-selected="false"
                    >
                        Appetizers
                    </a>
                </li>
                <li class="nav-item" role="presentation">
                    <a
                        class="nav-link"
                        id="pills-drinks-tab"
                        data-bs-toggle="pill"
                        href="#pills-drinks"
                        role="tab"
                        aria-controls="pills-drinks"
                        aria-selected="false"
                    >
                        Drinks
                    </a>
                </li>
            </ul>
        </div>
        <div class="card-body pt-4 p-3">
            <div class="row">
                <!-- Column for Menu Items -->
                <div class="col-md-6">
                    <div class="tab-content" id="pills-tabContent">
                        <!-- Main Courses Tab -->
                        <div
                            class="tab-pane fade show active"
                            id="pills-main-courses"
                            role="tabpanel"
                            aria-labelledby="pills-main-courses-tab"
                        >
                            <div class="row">
                                <div class="col-lg-6 col-md-6 col-sm-12 mb-4" v-for="item in filteredMenuItems('Main course')" :key="item.id">
                                    <div class="card h-100">
                                        <img :src="item.image" class="card-img-top" alt="Menu Item" />
                                        <div class="card-body">
                                            <h5 class="card-title">{{ item.name }}</h5>
                                            <p class="card-text">{{ item.description }}</p>
                                            <p class="card-text"><strong>Price: </strong>${{ item.price }}</p>
                                            <button class="btn btn-primary" @click="addOrder(item)">Add Order</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Appetizers Tab -->
                        <div
                            class="tab-pane fade"
                            id="pills-appetizers"
                            role="tabpanel"
                            aria-labelledby="pills-appetizers-tab"
                        >
                            <div class="row">
                                <div class="col-lg-6 col-md-6 col-sm-12 mb-4" v-for="item in filteredMenuItems('Appetizer')" :key="item.id">
                                    <div class="card h-100">
                                        <img :src="item.image" class="card-img-top" alt="Menu Item" />
                                        <div class="card-body">
                                            <h5 class="card-title">{{ item.name }}</h5>
                                            <p class="card-text">{{ item.description }}</p>
                                            <p class="card-text"><strong>Price: </strong>${{ item.price }}</p>
                                            <button class="btn btn-primary" @click="addOrder(item)">Add Order</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Drinks Tab -->
                        <div
                            class="tab-pane fade"
                            id="pills-drinks"
                            role="tabpanel"
                            aria-labelledby="pills-drinks-tab"
                        >
                            <div class="row">
                                <div class="col-lg-6 col-md-6 col-sm-12 mb-4" v-for="item in filteredMenuItems('Drink')" :key="item.id">
                                    <div class="card h-100">
                                        <img :src="item.image" class="card-img-top" alt="Menu Item" />
                                        <div class="card-body">
                                            <h5 class="card-title">{{ item.name }}</h5>
                                            <p class="card-text">{{ item.description }}</p>
                                            <p class="card-text"><strong>Price: </strong>${{ item.price }}</p>
                                            <button class="btn btn-primary" @click="addOrder(item)">Add Order</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Column for Order Summary -->
                <div class="col-md-6">
                    <h5>Your Orders</h5>
                    <ul class="list-group">
                        <li class="list-group-item" v-for="(order, index) in orders" :key="index">
                            {{ order.name }} - ${{ order.price }} 
                            <span v-if="order.quantity > 1"> (x{{ order.quantity }})</span>
                            <button class="btn btn-danger btn-sm float-end" @click="removeOrder(order)">Remove</button>
                        </li>
                    </ul>
                    <div class="mt-3">
                        <strong>Total: ${{ total }}</strong>
                    </div>
                    <div class="mt-3">
                        <label for="reservationSelect">Select Reservation:</label>
                        <select id="reservationSelect" v-model="selectedReservation" class="form-select">
                            <option v-for="reservation in reservations" :key="reservation.id" :value="reservation.id">
                                {{ reservation.customerName }} - Table: {{ reservation.table }} at {{ reservation.time }}
                            </option>
                        </select>
                    </div>
                    <div class="mt-3">
                        <label for="orderName">Order Name:</label>
                        <input
                            id="orderName"
                            v-model="orderName"
                            type="text"
                            class="form-control"
                            placeholder="Enter a name for this order"
                        />
                    </div>
                    <button class="btn btn-success mt-3" @click="saveOrder">Save Order</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

const menuItems = ref([]);
const orders = ref([]);
const reservations = ref([]);
const selectedReservation = ref(null);
const orderName = ref(''); // Nuevo campo para el nombre de la orden

// Fetch menu items from Firebase Firestore
const fetchMenuItems = async () => {
    const db = getFirestore();
    const menuRef = collection(db, 'menuItems');
    const querySnapshot = await getDocs(menuRef);
    menuItems.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch reservations from Firebase Firestore
const fetchReservations = async () => {
    const db = getFirestore();
    const reservationsRef = collection(db, 'reservations');
    const querySnapshot = await getDocs(reservationsRef);
    reservations.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

onMounted(async () => {
    await fetchMenuItems();
    await fetchReservations();
});

const filteredMenuItems = (category) => {
    return menuItems.value.filter(item => item.category === category);
};

// Add order function
const addOrder = (item) => {
    const existingOrder = orders.value.find(o => o.id === item.id);
    if (existingOrder) {
        existingOrder.quantity += 1; // Increase quantity if the item already exists
    } else {
        orders.value.push({ ...item, quantity: 1 }); // Add new order with quantity
    }
    console.log(`Added ${item.name} to the order.`);
};

// Remove order function
const removeOrder = (order) => {
    orders.value = orders.value.filter(o => o.id !== order.id);
};

// Calculate total price
const total = computed(() => {
    return orders.value.reduce((sum, order) => sum + (order.price * order.quantity), 0);
});

// Save order function
const saveOrder = async () => {
    if (selectedReservation.value && orders.value.length > 0 && orderName.value) {
        const db = getFirestore();
        try {
            const orderData = {
                reservationId: selectedReservation.value,
                orderName: orderName.value, // Nombre de la orden
                items: orders.value.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
                total: total.value,
                createdAt: new Date()
            };
            await addDoc(collection(db, 'orders'), orderData); // Save order to Firestore
            alert('Order saved successfully');
            // Clear orders after saving
            orders.value = [];
            orderName.value = ''; // Limpiar el nombre de la orden después de guardarla
        } catch (error) {
            console.error('Error saving order: ', error);
        }
    } else {
        alert('Please select a reservation, add items to the order, and enter a name for the order.');
    }
};
</script>

<style scoped>
.card-img-top {
    height: 150px; /* Ajusta la altura de las imágenes */
    object-fit: cover; /* Mantiene la proporción de las imágenes */
}
</style>
