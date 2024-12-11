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
            <!-- Main Courses Tab -->
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

            <!-- Appetizers Tab -->
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

            <!-- Drinks Tab -->
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

        <!-- Orders Summary -->
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

          <!-- Reservation Selection -->
          <div class="mt-3">
            <label for="reservationSelect">Seleccionar Reservación:</label>
            <select id="reservationSelect" v-model="selectedReservation" class="form-select" @change="updateAvailableChairs">
              <option v-for="reservation in filteredReservations" :key="reservation.id" :value="reservation.id">
                {{ reservation.customerName }} - Mesa: {{ reservation.table }} a las {{ reservation.time }}
              </option>
            </select>
          </div>

          <!-- Chair Selection -->
          <div class="mt-3" v-if="availableChairs.length > 0">
            <label for="chairSelection">Seleccionar Sillas:</label>
            <select id="chairSelection" v-model="selectedChairs" class="form-select" multiple>
              <option v-for="chair in availableChairs" :key="chair" :value="chair">
                Silla {{ chair }}
              </option>
            </select>
          </div>

          <!-- Order Name Input -->
          <div class="mt-3">
            <label for="orderName">Nombre de la Orden:</label>
            <input id="orderName" v-model="orderName" type="text" class="form-control" placeholder="Ingrese un nombre para esta orden" />
          </div>

          <!-- Save Order Button -->
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
const timeSlots = ref([
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
  "20:00 - 22:00",
]);

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

// Get current time slot based on the current time
const getCurrentTimeSlot = () => {
  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes(); // Convert current time to HHMM format

  return timeSlots.value.map(slot => {
    const [start, end] = slot.split(' - ').map(time => {
      const [hours, minutes] = time.split(':');
      return parseInt(hours) * 100 + parseInt(minutes); // Convert to HHMM
    });

    return { start, end, slot };
  }).find(({ start, end }) => currentTime >= start && currentTime <= end);
};

// Filter reservations by today's date and time slot
const filterReservationsByTime = () => {
  const currentTimeSlot = getCurrentTimeSlot();  // Hora actual
  const today = new Date().toISOString().split('T')[0]; // Fecha de hoy en formato YYYY-MM-DD
  
  filteredReservations.value = reservations.value.filter(reservation => {
    const reservationDate = reservation.date; // Fecha de la reserva en formato YYYY-MM-DD
    const reservationTime = parseInt(reservation.time.replace(':', '').substring(0, 4)); // Hora de la reserva en HHMM (solo hora y minutos)

    // Comparar si la reserva es para hoy y dentro del intervalo de tiempo actual
    return reservationDate === today && reservationTime >= currentTimeSlot.start && reservationTime <= currentTimeSlot.end;
  });
};

// Filter menu items by category
const filteredMenuItems = (category) => {
  return menuItems.value.filter(item => item.category === category);
};

// Filter reservations with status 'standby time'
const filteredReservations = computed(() => {
  return reservations.value.filter(reservation => reservation.status === 'standby time');
});

// Update available chairs based on selected reservation
const updateAvailableChairs = () => {
  const reservation = reservations.value.find(res => res.id === selectedReservation.value);
  
  if (reservation) {
    availableChairs.value = Array.from({ length: reservation.peopleCount }, (_, i) => i + 1);  // Generar sillas según el peopleCount
  } else {
    availableChairs.value = [];
  }
};

// Add order to the list
const addOrder = (item) => {
  const existingOrder = orders.value.find(o => o.id === item.id);
  if (existingOrder) {
    existingOrder.quantity++;
  } else {
    orders.value.push({ ...item, quantity: 1 });
  }
};

// Remove order from the list
const removeOrder = (order) => {
  orders.value = orders.value.filter(o => o !== order);
};

// Save order to Firestore
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

// Fetch initial data
onMounted(async () => {
  await fetchMenuItems();
  await fetchReservations();
  filterReservationsByTime(); // Filter reservations based on current time
});
</script>
