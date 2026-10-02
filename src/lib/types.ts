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
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["id"];
            isOneToOne: false;
            referencedRelation: "order_items";
            referencedColumns: ["order_id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
