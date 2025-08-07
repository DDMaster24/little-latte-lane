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
          id: number;
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
          id: number;
          order_id: number;
          menu_item_id: number;
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
      menu_items: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          price: number;
          category_id: number;
          image_url: string | null;
          stock: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['menu_items']['Row']>;
        Update: Partial<Database['public']['Tables']['menu_items']['Row']>;
      };
      categories: {
        Row: {
          id: number;
          name: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['categories']['Row']>;
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      bookings: {
        Row: {
          id: number;
          user_id: string;
          type: 'table' | 'golf';
          date_time: string;
          number_of_people: number;
          pre_order: boolean;
          status: 'pending' | 'confirmed' | 'cancelled';
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['bookings']['Row']>;
        Update: Partial<Database['public']['Tables']['bookings']['Row']>;
      };
      requests: {
        Row: {
          id: number;
          staff_id: string;
          item_id: number;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['requests']['Row']>;
        Update: Partial<Database['public']['Tables']['requests']['Row']>;
      };
    };
  };
};