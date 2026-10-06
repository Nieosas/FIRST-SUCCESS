import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ProductScreen } from "./src/screens/ProductScreen";
import { CartScreen } from "./src/screens/CartScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";
import { CheckoutScreen } from "./src/screens/CheckoutScreen";
import type { RootStackParamList } from "./src/navigation/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerTintColor: "#18181b",
                headerTitleStyle: { fontWeight: "700" },
                contentStyle: { backgroundColor: "#fff" },
              }}
            >
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: "PhoneDeck" }}
              />
              <Stack.Screen
                name="Product"
                component={ProductScreen}
                options={{ title: "" }}
              />
              <Stack.Screen
                name="Cart"
                component={CartScreen}
                options={{ title: "Cart" }}
              />
              <Stack.Screen
                name="Checkout"
                component={CheckoutScreen}
                options={{ title: "Checkout" }}
              />
              <Stack.Screen
                name="Orders"
                component={OrdersScreen}
                options={{ title: "Orders" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
