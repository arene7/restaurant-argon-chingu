import { createRouter, createWebHistory } from "vue-router";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Import Firestore methods
import Dashboard from "../views/Dashboard.vue";
import Tables from "../views/Tables.vue";
import Reservations from "../views/Reservations.vue";
import Billing from "../views/Billing.vue";
import VirtualReality from "../views/VirtualReality.vue";
import RTL from "../views/Rtl.vue";
import Profile from "../views/Profile.vue";
import Signup from "../views/Signup.vue";
import Signin from "../views/Signin.vue";

// Initialize Firestore
const db = getFirestore();

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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

// Navigation guard for role-based access control
router.beforeEach(async (to, from, next) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    try {
      const role = await getUserRole(user.uid);
      const allowedRoles = to.meta.roles;

      if (allowedRoles && !allowedRoles.includes(role)) {
        // If the role is not allowed, redirect to the dashboard
        return next({ name: "Dashboard" });
      }
      next(); // Allow access to the route
    } catch (error) {
      console.error("Error fetching user role:", error);
      next({ name: "Signin" }); // Redirect to sign-in on error
    }
  } else {
    // If the user is not authenticated, redirect to sign-in
    next({ name: "Signin" });
  }
});

// Function to get user role from Firestore
async function getUserRole(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data().role; // Return the user's role
  } else {
    throw new Error("User role not found");
  }
}

export default router;
