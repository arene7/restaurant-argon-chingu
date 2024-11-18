import { createRouter, createWebHistory } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase Auth
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Firestore methods
import Dashboard from "../views/Dashboard.vue";
import Tables from "../views/Tables.vue";
import Reservations from "../views/Reservations.vue";
import Orders from "../views/Orders.vue";
import Billing from "../views/Billing.vue";
import VirtualReality from "../views/VirtualReality.vue";
import RTL from "../views/Rtl.vue";
import Profile from "../views/Profile.vue";
import Signup from "../views/Signup.vue";
import Signin from "../views/Signin.vue";
import ReservationsUsers from "../views/Reservation-users.vue"; // Importamos el nuevo componente público

// Estado global para el usuario autenticado
import { ref } from "vue";
const currentUser = ref(null);

// Inicializar Firestore
const db = getFirestore();

// Configurar rutas
const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/dashboard-default",
  },
  {
    path: "/dashboard-default",
    name: "Dashboard",
    component: Dashboard,
    meta: { roles: ["Administrator", "Cashier", "Receptionist", "Waiter"] }
  },
  {
    path: "/reservations",
    name: "Reservations",
    component: Reservations,
    meta: { roles: ["Administrator", "Receptionist", "Cashier"] }
  },
  {
    path: "/orders",
    name: "Orders",
    component: Orders,
    meta: { roles: ["Administrator", "Cashier"] }
  },
  {
    path: "/tables",
    name: "Tables",
    component: Tables,
    meta: { roles: ["Administrator", "Cashier"] }
  },
  {
    path: "/billing",
    name: "Billing",
    component: Billing,
    meta: { roles: ["Administrator"] }
  },
  {
    path: "/virtual-reality",
    name: "Virtual Reality",
    component: VirtualReality,
    meta: { roles: ["Administrator"] }
  },
  {
    path: "/rtl-page",
    name: "RTL",
    component: RTL,
    meta: { roles: ["Administrator"] }
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { roles: ["Administrator", "Cashier", "Receptionist", "Waiter"] }
  },
  {
    path: "/signin",
    name: "Signin",
    component: Signin,
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
  },
  {
    path: "/reservations-users", // Nueva ruta pública
    name: "ReservationsUsers",
    component: ReservationsUsers,
    meta: { public: true }, // Indica que es una ruta pública
  },
];

// Crear router
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

// Escuchar cambios en el estado de autenticación
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser.value = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user)); // Guardar el usuario en sessionStorage
  } else {
    currentUser.value = null;
    sessionStorage.removeItem('currentUser'); // Eliminar el usuario de sessionStorage
  }
});

// Función para obtener el rol del usuario desde Firestore
async function getUserRole(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data().role;
    } else {
      console.warn("El documento del usuario no existe para el UID:", uid);
      throw new Error("El rol del usuario no se encontró");
    }
  } catch (error) {
    console.error("Error al obtener el rol del usuario:", error);
    throw error;
  }
}

// Guard de navegación para control de acceso basado en roles
router.beforeEach(async (to, from, next) => {
  // Recuperar el estado del usuario de sessionStorage si está disponible
  if (!currentUser.value && sessionStorage.getItem('currentUser')) {
    currentUser.value = JSON.parse(sessionStorage.getItem('currentUser'));
  }

  if (to.meta.public) {
    // Permitir acceso directo a rutas públicas
    return next();
  }

  if (currentUser.value) {
    try {
      const role = await getUserRole(currentUser.value.uid);
      const allowedRoles = to.meta.roles;

      if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirigir a una ruta segura si el rol no está permitido
        return next({ name: "Dashboard" });
      }
      next(); // Permitir navegación si el rol es válido
    } catch (error) {
      console.error("Error en el guard de navegación:", error);
      return next({ name: "Signin" }); // Redirigir al inicio de sesión en caso de error
    }
  } else {
    if (to.name === "Signin" || to.name === "Signup") {
      // Permitir acceso a las rutas de inicio de sesión y registro
      return next();
    }

    // Redirigir a inicio de sesión si el usuario no está autenticado
    return next({ name: "Signin" });
  }
});

export default router;
