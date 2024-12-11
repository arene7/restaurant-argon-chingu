<template>
    <div class="card">
      <div class="card-header pb-0 px-3 text-center">
        <h3>Gestión de Órdenes</h3>
      </div>
      <div class="card-body pt-4 p-3">
        <div class="row">
          <!-- Display Orders as Cards -->
          <div class="col-md-4 mb-4" v-for="order in ordersList" :key="order.id">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Orden: {{ order.name }}</h6>
                <span class="badge" :class="getStatusClass(order.status)">{{ order.status }}</span>
              </div>
              <div class="card-body">
                <p class="text-sm"><strong>Reservación:</strong> {{ getReservationDetails(order.reservationId) }}</p>
                <p class="text-sm"><strong>Sillas:</strong> {{ order.chairs.join(', ') }}</p>
                <p class="text-sm"><strong>Total:</strong> ${{ order.total }}</p>
  
                <!-- Change Status -->
                <div class="mt-2">
                  <label for="statusSelect-{{ order.id }}" class="form-label">Cambiar Estado:</label>
                  <select
                    id="statusSelect-{{ order.id }}"
                    v-model="order.status"
                    class="form-select form-select-sm"
                    @change="updateOrderStatus(order)"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="abierta">Abierta</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                </div>
  
                <!-- Order Items -->
                <div class="mt-3">
                  <h6 class="text-sm">Items:</h6>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item py-1 px-2" v-for="item in order.items" :key="item.name">
                      {{ item.name }} - ${{ item.price }} x{{ item.quantity }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
  
  const ordersList = ref([]);
  const reservations = ref([]);
  
  // Fetch orders from Firebase Firestore
  const fetchOrders = async () => {
    const db = getFirestore();
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);
    ordersList.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  
  // Fetch reservations from Firebase Firestore
  const fetchReservations = async () => {
    const db = getFirestore();
    const reservationsRef = collection(db, 'reservations');
    const querySnapshot = await getDocs(reservationsRef);
    reservations.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  
  // Get reservation details
  const getReservationDetails = (reservationId) => {
    const reservation = reservations.value.find(res => res.id === reservationId);
    return reservation
      ? `${reservation.customerName} - Mesa: ${reservation.table} a las ${reservation.time}`
      : 'No asignada';
  };
  
  // Update order status in Firestore
  const updateOrderStatus = async (order) => {
    const db = getFirestore();
    const orderDoc = doc(db, 'orders', order.id);
  
    await updateDoc(orderDoc, { status: order.status });
    alert(`El estado de la orden '${order.name}' se ha actualizado a '${order.status}'.`);
  };
  
  // Get CSS class for status badge
  const getStatusClass = (status) => {
    return {
      pendiente: 'bg-warning text-dark',
      abierta: 'bg-primary text-light',
      cerrada: 'bg-success text-light',
    }[status];
  };
  
  // Fetch initial data
  onMounted(async () => {
    await fetchOrders();
    await fetchReservations();
  });
  </script>
  
  <style>
  .card {
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  .card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
  }
  .card-body {
    padding: 1rem;
  }
  .badge {
    font-size: 0.75rem;
    padding: 0.4em 0.6em;
  }
  .text-sm {
    font-size: 0.875rem;
    color: #6c757d;
  }
  </style>
  