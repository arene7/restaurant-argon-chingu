<script setup>
import { ref, onMounted } from "vue";
import { db } from "@/firebase"; // Asegúrate de que este archivo esté configurado
import { collection, onSnapshot } from "firebase/firestore";
import ArgonButton from "@/components/ArgonButton.vue";
import jsPDF from "jspdf";

const orders = ref([]);
const filteredOrders = ref([]);

// Define los intervalos de horas
const timeIntervals = [
  { start: "08:00", end: "10:00" },
  { start: "10:00", end: "12:00" },
  { start: "12:00", end: "14:00" },
  { start: "14:00", end: "16:00" },
  { start: "16:00", end: "18:00" },
  { start: "18:00", end: "20:00" },
  { start: "20:00", end: "22:00" },
];

function getCurrentInterval() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // Obtiene la hora actual en formato HH:mm

  return timeIntervals.find(
    (interval) => currentTime >= interval.start && currentTime < interval.end
  );
}

function generatePDF(order) {
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFontSize(18);
  doc.setTextColor(40, 116, 166);
  doc.text("Chingu Bar & Kitchen", 105, 20, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Detalles de la Orden", 105, 30, { align: "center" });

  // Información de la orden
  doc.setFontSize(12);
  doc.text(`ID de la Orden: ${order.id}`, 20, 50);
  doc.text(`Fecha: ${order.createdAt?.toDate().toLocaleString() || "Fecha desconocida"}`, 20, 60);
  doc.text(`Total: $${order.total || "0"}`, 20, 70);

  // Línea divisoria
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 80, 190, 80);

  // Detalles adicionales (puedes agregar más si hay)
  doc.text("¡Gracias por tu compra!", 105, 100, { align: "center" });
  doc.setFontSize(10);
  doc.text("Esperamos que disfrutes tu experiencia en Chingu Bar & Kitchen.", 105, 110, { align: "center" });

  // Pie de página
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Chingu Bar & Kitchen - Orden generada automáticamente", 105, 280, { align: "center" });

  doc.save(`Orden_${order.id}.pdf`);
}

onMounted(() => {
  const ordersRef = collection(db, "orders");

  onSnapshot(ordersRef, (snapshot) => {
    orders.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const currentInterval = getCurrentInterval();
    if (currentInterval) {
      const { start, end } = currentInterval;

      filteredOrders.value = orders.value.filter((order) => {
        if (!order.createdAt) return false;

        const orderTime = order.createdAt.toDate().toTimeString().slice(0, 5);
        return orderTime >= start && orderTime < end;
      });
    } else {
      filteredOrders.value = [];
    }
  });
});
</script>

<template>
  <div class="card pb-4">
    <div class="card-header pb-0 p-3">
      <div class="row">
        <div class="col-6 d-flex align-items-center">
          <h6 class="mb-0">Órdenes</h6>
        </div>
        <div class="col-6 text-end">
          <argon-button color="success" size="sm" variant="outline">
            Ver todas
          </argon-button>
        </div>
      </div>
    </div>
    <div class="card-body p-3 pb-0 mb-0">
      <ul class="list-group">
        <li
          v-for="order in filteredOrders"
          :key="order.id"
          class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg"
        >
          <div class="d-flex flex-column">
            <h6 class="mb-1 text-dark font-weight-bold text-sm">
              {{ order.createdAt?.toDate().toLocaleDateString() || "Fecha desconocida" }}
            </h6>
            <span class="text-xs">{{ order.id }}</span>
          </div>
          <div class="d-flex align-items-center text-sm">
            ${{ order.total || "0" }}
            <button
              class="btn btn-link text-dark text-sm mb-0 px-0 ms-4"
              @click="generatePDF(order)"
            >
              <i class="fas fa-file-pdf text-lg me-1" aria-hidden="true"></i>
              PDF
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
