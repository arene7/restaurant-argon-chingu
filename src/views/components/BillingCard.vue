<template>
  <div>
    <div>
      <div class="card mb-4">
        <div class="card-header pb-0 d-flex justify-content-between align-items-center">
          <h6>Búsqueda de Facturación</h6>
        </div>
        <div class="card-body px-3 pt-3 pb-2">
          <div class="row mb-3">
            <!-- Tipo de búsqueda -->
            <div class="col-md-6">
              <label for="searchType" class="form-label">Tipo de Búsqueda:</label>
              <select v-model="searchType" id="searchType" class="form-select">
                <option value="chair">Por Silla</option>
                <option value="reservation">Por Reservación</option>
              </select>
            </div>
            
            <!-- Búsqueda por silla -->
            <div class="col-md-6" v-if="searchType === 'chair'">
              <label for="chairNumber" class="form-label">Número de Silla:</label>
              <input 
                id="chairNumber" 
                v-model="searchCriteria.chair" 
                type="number" 
                class="form-control" 
                placeholder="Ingrese el número de silla" 
              />
            </div>

            <!-- Búsqueda por reservación -->
            <div class="col-md-6" v-if="searchType === 'reservation'">
              <label for="reservationId" class="form-label">Reservación:</label>
              <select v-model="searchCriteria.reservation" id="reservationId" class="form-select">
                <option v-for="reservation in reservations" :key="reservation.id" :value="reservation.id">
                  {{ reservation.id }}
                </option>
              </select>
            </div>
          </div>

          <!-- Botón de búsqueda -->
          <div class="text-end mb-3">
            <button class="btn btn-primary" @click="fetchBillingInfo">Buscar</button>
          </div>

          <!-- Resultados de facturación -->
          <div v-if="billingResults.length > 0" class="mt-4">
            <h6>Detalles de Facturación (Órdenes Cerradas)</h6>
            <ul class="list-group">
              <li
                v-for="order in billingResults" 
                :key="order.id" 
                class="list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg"
              >
                <div class="d-flex flex-column">
                  <h6 class="mb-3 text-sm">Orden: {{ order.name }}</h6>
                  <span class="mb-2 text-xs">
                    Artículos: 
                    <span class="text-dark font-weight-bold ms-sm-2">
                      {{ order.items.map(item => `${item.name} (x${item.quantity})`).join(', ') }}
                    </span>
                  </span>
                  <span class="mb-2 text-xs">
                    Total: 
                    <span class="text-dark font-weight-bold ms-sm-2">
                      ${{ order.total }}
                    </span>
                  </span>
                </div>
              </li>
            </ul>

            <!-- Botones para PDF y guardar factura -->
            <div class="text-end mt-3">
              <button class="btn btn-success me-2" @click="generatePDF">Generar Factura (PDF)</button>
              <button class="btn btn-primary" @click="saveInvoice">Guardar Factura</button>
            </div>
          </div>

          <div v-else-if="searched" class="mt-4">
            <p class="text-center">No se encontraron órdenes cerradas para los criterios seleccionados.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import jsPDF from 'jspdf'; // Para generación de PDF

export default {
  setup() {
    const reservations = ref([
      { id: '17Un4zfdWnXs7Jdkr8Ef', customerName: 'Juan Pérez', table: '1', chairs: [1, 2, 3] },
      { id: '17Un4zfdWnXs7Jdkr8Eg', customerName: 'Ana Gómez', table: '2', chairs: [4, 5] },
    ]);

    const orders = ref([]);
    const searchType = ref('chair');
    const searchCriteria = ref({ chair: '', reservation: '' });
    const billingResults = ref([]);
    const searched = ref(false);

    const fetchOrdersFromDB = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        orders.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    const fetchBillingInfo = () => {
      billingResults.value = [];
      searched.value = true;

      if (searchType.value === 'chair' && searchCriteria.value.chair) {
        billingResults.value = orders.value.filter(
          order => order.chairs.includes(parseInt(searchCriteria.value.chair)) && order.status === 'pendiente'
        );
      } else if (searchType.value === 'reservation' && searchCriteria.value.reservation) {
        billingResults.value = orders.value.filter(
          order => order.reservationId === searchCriteria.value.reservation && order.status === 'pendiente'
        );
      }
    };

    const generatePDF = () => {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Chingu Bar & Kitchen', 10, 10);
      doc.setFontSize(12);
      doc.text(`Fecha: ${new Date().toLocaleDateString()} Hora: ${new Date().toLocaleTimeString()}`, 10, 20);

      billingResults.value.forEach((order, index) => {
        const startY = 30 + index * 30;
        doc.text(`Orden: ${order.name}`, 10, startY);
        doc.text(`Artículos: ${order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}`, 10, startY + 10);
        doc.text(`Total: $${order.total}`, 10, startY + 20);
      });

      doc.save('Factura_Chingu.pdf');
    };

    const saveInvoice = async () => {
      try {
        const invoiceData = {
          date: new Date(),
          orders: billingResults.value,
        };
        await addDoc(collection(db, 'invoices'), invoiceData);
        alert('Factura guardada exitosamente.');
      } catch (error) {
        console.error('Error al guardar la factura:', error);
      }
    };

    onMounted(fetchOrdersFromDB);

    return {
      reservations,
      orders,
      searchType,
      searchCriteria,
      billingResults,
      searched,
      fetchBillingInfo,
      generatePDF,
      saveInvoice,
    };
  },
};
</script>

<style>
.list-group-item {
  transition: box-shadow 0.3s;
}
.list-group-item:hover {
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
}
</style>
