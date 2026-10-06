export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price_cents: number;
  image_url: string | null;
  stock: number;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string | null;
  email: string;
  customer_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  status: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  created_at: string;
};

export type CartItemRow = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          category: string;
          price_cents: number;
          image_url?: string | null;
          stock?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          category?: string;
          price_cents?: number;
          image_url?: string | null;
          stock?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          customer_name: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state?: string | null;
          postal_code?: string | null;
          country: string;
          subtotal_cents: number;
          shipping_cents?: number;
          total_cents: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          customer_name?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          subtotal_cents?: number;
          shipping_cents?: number;
          total_cents?: number;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          unit_price_cents: number;
          quantity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          unit_price_cents?: number;
          quantity?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: CartItemRow;
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      add_cart_item: {
        Args: { p_product_id: string; p_quantity?: number };
        Returns: undefined;
      };
      set_cart_quantity: {
        Args: { p_product_id: string; p_quantity: number };
        Returns: undefined;
      };
      remove_cart_item: {
        Args: { p_product_id: string };
        Returns: undefined;
      };
      clear_cart: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
  };
}
