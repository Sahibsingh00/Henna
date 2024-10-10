export interface Service {
  id?: string;
  name: string;
  complexity: 'Simple' | 'Medium' | 'Hard';
  prices?: {
    Simple: number;
    Medium: number;
    Hard: number;
  };
}
  
  export interface BookingData {
    services: Service[];
    date: Date | null;
    personalDetails: Record<string, string>;
  }

export type Booking = {
  id: string;
  date: { seconds: number };
  services: { name: string; complexity: string; prices: { [key: string]: number } }[];
  status: 'pending' | 'confirmed' | 'cancelled';
  userEmail: string;
  personalDetails: {
    name: string;
    phone: string;
  };
  userId: string;
  createdAt: { seconds: number };
  isDeleted: boolean; // Add this line
};