export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          total: number;
          delivery_type: string;
          created_at: string;
          assigned_staff_id: string | null;
        };
        Insert: Partial<Database['public']['Tables']['orders']['Row']>;
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
        };
        Insert: Partial<Database['public']['Tables']['order_items']['Row']>;
        Update: Partial<Database['public']['Tables']['order_items']['Row']>;
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          role: string;
          address: string | null;
          phone: string | null;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      menu_item: {
        Row: {
          id: string;
          name: string;
          price: number;
        };
        Insert: Partial<Database['public']['Tables']['menu_item']['Row']>;
        Update: Partial<Database['public']['Tables']['menu_item']['Row']>;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          type: 'table' | 'golf';
          date: string;
          time_slot: string;
          status: 'pending' | 'confirmed' | 'cancelled';
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['bookings']['Row']>;
        Update: Partial<Database['public']['Tables']['bookings']['Row']>;
      };
    };
  };
};