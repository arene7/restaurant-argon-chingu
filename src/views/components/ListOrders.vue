<template>
  <div class="card">
    <div class="card-header pb-0 px-3 text-center">
      <ul class="nav nav-pills justify-content-center" id="pills-tab" role="tablist">
        <li class="nav-item" role="presentation">
          <a class="nav-link" id="pills-main-courses-tab" data-bs-toggle="pill" href="#pills-main-courses" role="tab" aria-controls="pills-main-courses" aria-selected="true">
            <i class="fas fa-utensils"></i> Platos Principales
          </a>
        </li>
        <li class="nav-item" role="presentation">
          <a class="nav-link" id="pills-appetizers-tab" data-bs-toggle="pill" href="#pills-appetizers" role="tab" aria-controls="pills-appetizers" aria-selected="false">
            <i class="fas fa-hamburger"></i> Aperitivos
          </a>
        </li>
        <li class="nav-item" role="presentation">
          <a class="nav-link" id="pills-drinks-tab" data-bs-toggle="pill" href="#pills-drinks" role="tab" aria-controls="pills-drinks" aria-selected="false">
            <i class="fas fa-cocktail"></i> Bebidas
          </a>
        </li>
      </ul>
    </div>
    <div class="card-body pt-4 p-3">
      <div class="row">
        <div class="col-md-7">
          <div class="tab-content" id="pills-tabContent">
            <div class="tab-pane fade show active" id="pills-main-courses" role="tabpanel" aria-labelledby="pills-main-courses-tab">
              <div class="row">
                <div class="col-lg-6 col-md-6 col-sm-12 mb-4" v-for="item in filteredMenuItems('Main course')" :key="item.id">
                  <div class="card h-100">
                    <img :src="item.image" class="card-img-top" alt="Menu Item" />
                    <div class="card-body">
                      <h5 class="card-title">{{ item.name }}</h5>
                      <p class="card-text">{{ item.description }}</p>
                      <p class="card-text"><strong>Precio: </strong>${{ item.price }}</p>
                      <button class="btn btn-primary" @click="addOrder(item)">Agregar Orden</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="tab-pane fade" id="pills-appetizers" role="tabpanel" aria-labelledby="pills-appetizers-tab">
              <div class="row">
                <div class="col-lg-6 col-md-6 col-sm-12 mb-4" v-for="item in filteredMenuItems('Appetizer')" :key="item.id">
                  <div class="card h-100">
                    <img :src="item.image" class="card-img-top" alt="Menu Item" />
                    <div class="card-body">
                      <h5 class="card-title">{{ item.name }}</h5>
                      <p class="card-text">{{ item.description }}</p>
                      <p class="card-text"><strong>Precio: </strong>${{ item.price }}</p>
                      <button class="btn btn-primary" @click="addOrder(item)">Agregar Orden</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="tab-pane fade" id="pills-drinks" role="tabpanel" aria-labelledby="pills-drinks-tab">
              <div class="row">
                <div class="col-lg-6 col-md-6 col-sm-12 mb-4" v-for="item in filteredMenuItems('Drink')" :key="item.id">
                  <div class="card h-100">
                    <img :src="item.image" class="card-img-top" alt="Menu Item" />
                    <div class="card-body">
                      <h5 class="card-title">{{ item.name }}</h5>
                      <p class="card-text">{{ item.description }}</p>
                      <p class="card-text"><strong>Precio: </strong>${{ item.price }}</p>
                      <button class="btn btn-primary" @click="addOrder(item)">Agregar Orden</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-5" v-if="orders.length > 0">
          <h5>Tus Órdenes</h5>
          <ul class="list-group">
            <li class="list-group-item" v-for="(order, index) in orders" :key="index">
              <input type="checkbox" class="form-check-input me-2" :id="'order-' + index" v-model="order.selected" />
              <label :for="'order-' + index">
                {{ order.name }} - ${{ order.price }}
                <span v-if="order.quantity > 1"> (x{{ order.quantity }})</span>
              </label>
              <button class="btn btn-danger btn-sm float-end" @click="removeOrder(order)">Eliminar</button>
            </li>
          </ul>
          <div class="mt-3">
            <strong>Total: ${{ total }}</strong>
          </div>
          <div class="mt-3">
            <label for="reservationSelect">Seleccionar Reservación:</label>
            <select id="reservationSelect" v-model="selectedReservation" class="form-select" @change="updateAvailableChairs">
              <option v-for="reservation in filteredReservations" :key="reservation.id" :value="reservation.id">
                {{ reservation.customerName }} - Mesa: {{ reservation.table }} a las {{ reservation.time }}
              </option>
            </select>
          </div>
          <div class="mt-3" v-if="availableChairs.length > 0">
            <label for="chairSelection">Seleccionar Sillas:</label>
            <select id="chairSelection" v-model="selectedChairs" class="form-select" multiple>
              <option v-for="chair in availableChairs" :key="chair" :value="chair">
                Silla {{ chair }}
              </option>
            </select>
          </div>
          <div class="mt-3">
            <label for="orderName">Nombre de la Orden:</label>
            <input id="orderName" v-model="orderName" type="text" class="form-control" placeholder="Ingrese un nombre para esta orden" />
          </div>
          <button class="btn btn-success mt-3" @click="saveOrder">Guardar Orden</button>
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
const selectedChairs = ref([]);
const orderName = ref('');
const availableChairs = ref([]);

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

// Filter menu items by category
const filteredMenuItems = (category) => {
  return menuItems.value.filter(item => item.category === category);
};

// Filter reservations by status 'standby time'
const filteredReservations = computed(() => {
  return reservations.value.filter(reservation => reservation.status === 'standby time');
});

// Update available chairs based on the selected reservation
const updateAvailableChairs = () => {
  const reservation = reservations.value.find(res => res.id === selectedReservation.value);
  if (reservation) {
    availableChairs.value = Array.from({ length: reservation.chairCount }, (_, i) => i + 1);
  } else {
    availableChairs.value = [];
  }
};

// Add order function
const addOrder = (item) => {
  const existingOrder = orders.value.find(o => o.id === item.id);
  if (existingOrder) {
    existingOrder.quantity++;
  } else {
    orders.value.push({ ...item, quantity: 1 });
  }
};

// Remove order function
const removeOrder = (order) => {
  orders.value = orders.value.filter(o => o !== order);
};

// Save order function
const saveOrder = async () => {
  if (!orderName.value || !selectedReservation.value) {
    alert('Por favor ingrese un nombre para la orden y seleccione una reservación.');
    return;
  }
  
  const db = getFirestore();
  const ordersRef = collection(db, 'orders');
  
  const newOrder = {
    name: orderName.value,
    reservationId: selectedReservation.value,
    chairs: selectedChairs.value,
    total: total,
    items: orders.value.map(order => ({ name: order.name, price: order.price, quantity: order.quantity })),
  };
  
  await addDoc(ordersRef, newOrder);
  
  // Clear order after saving
  orders.value = [];
  orderName.value = '';
  selectedChairs.value = [];
};

// Calculate total price of orders
const total = computed(() => {
  return orders.value.reduce((sum, order) => sum + (order.price * order.quantity), 0);
});
</script>
