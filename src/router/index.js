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
import ReservationsUsers from "../views/Reservation-users.vue"; // Componente público
import Unauthorized from "../views/401.vue"; // Página 401

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
    meta: { roles: ["Administrador", "Cajero", "Recepcionista", "Mesero"] },
  },
  {
    path: "/reservations",
    name: "Reservations",
    component: Reservations,
    meta: { roles: ["Administrador", "Recepcionista", "Cajero"] },
  },
  {
    path: "/orders",
    name: "Orders",
    component: Orders,
    meta: { roles: ["Administrador", "Cajero"] },
  },
  {
    path: "/tables",
    name: "Tables",
    component: Tables,
    meta: { roles: ["Administrador", "Cajero"] },
  },
  {
    path: "/billing",
    name: "Billing",
    component: Billing,
    meta: { roles: ["Administrador"] },
  },
  {
    path: "/virtual-reality",
    name: "Virtual Reality",
    component: VirtualReality,
    meta: { roles: ["Administrador"] },
  },
  {
    path: "/rtl-page",
    name: "RTL",
    component: RTL,
    meta: { roles: ["Administrador"] },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { roles: ["Administrador", "Cajero", "Recepcionista", "Mesero"] },
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
    path: "/reservations-users",
    name: "ReservationsUsers",
    component: ReservationsUsers,
    meta: { public: true },
  },
  {
    path: "/401",
    name: "Unauthorized",
    component: Unauthorized,
    meta: { public: true }, // Página pública
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
    sessionStorage.setItem("currentUser", JSON.stringify(user)); // Guardar el usuario en sessionStorage
  } else {
    currentUser.value = null;
    sessionStorage.removeItem("currentUser"); // Eliminar el usuario de sessionStorage
  }
});

// Función para obtener el rol y estado del usuario desde Firestore
async function getUserRoleAndStatus(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.warn("El documento del usuario no existe para el UID:", uid);
      throw new Error("El rol o estado del usuario no se encontró");
    }
  } catch (error) {
    console.error("Error al obtener el rol o estado del usuario:", error);
    throw error;
  }
}

// Guard de navegación para control de acceso basado en roles y estado
router.beforeEach(async (to, from, next) => {
  // Recuperar el estado del usuario desde sessionStorage si está disponible
  if (!currentUser.value && sessionStorage.getItem("currentUser")) {
    currentUser.value = JSON.parse(sessionStorage.getItem("currentUser"));
  }

  if (to.meta.public) {
    // Permitir acceso a rutas públicas
    return next();
  }

  if (currentUser.value) {
    try {
      const userData = await getUserRoleAndStatus(currentUser.value.uid);
      const { role, status } = userData;
      const allowedRoles = to.meta.roles;

      if (status !== "on") {
        console.warn("Acceso denegado: Usuario no autorizado.");
        return next({ name: "Signin" }); // Redirigir al inicio de sesión
      }

      if (allowedRoles && !allowedRoles.includes(role)) {
        console.warn("Acceso denegado: Rol no autorizado.");
        return next({ name: "Unauthorized" }); // Redirigir a 401
      }

      return next(); // Permitir acceso si todo está correcto
    } catch (error) {
      console.error("Error al validar usuario:", error);
      return next({ name: "Signin" }); // Redirigir al inicio de sesión
    }
  } else {
    if (to.name === "Signin" || to.name === "Signup") {
      // Permitir acceso a las rutas de inicio de sesión y registro
      return next();
    }

    // Redirigir a inicio de sesión si el usuario no está autenticado
    console.warn("Usuario no autenticado. Redirigiendo al inicio de sesión.");
    return next({ name: "Signin" });
  }
});

export default router;
