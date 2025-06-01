export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  geofence?: {
    type: 'circle' | 'polygon';
    center?: [number, number];
    radius?: number;
    coordinates?: [number, number][];
  };
  // Add other PO fields as needed
}

export interface Ticket {
  _id: string;
  poId: string;
  ticketNumber: string;
  materialType: string;
  quantity: number;
  unitOfMeasure: string;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
  };
  // Add other ticket fields as needed
}

export interface MaterialType {
  _id: string;
  name: string;
  description?: string;
}

export interface UnitOfMeasure {
  _id: string;
  name: string;
  symbol: string;
}

export interface Rate {
  _id: string;
  type: 'hauling' | 'material';
  materialType?: string;
  rate: number;
  unitOfMeasure: string;
  effectiveDate: Date;
  expiryDate?: Date;
} 