import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Rate {
  materialType: string;
  rate: number;
  unit: string;
}

interface PurchaseOrder {
  _id: string;
  haulerId: {
    name: string;
    email: string;
  };
  clientId: {
    name: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  haulerRates: Rate[];
  resaleRates: Rate[];
  jobDetails: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  geofence?: {
    type: 'Polygon' | 'Circle';
    coordinates?: number[][];
    center?: [number, number];
    radius?: number;
  };
}

// Mock data for when the backend is not available
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    _id: '60d21b4667d0d8992e610c85',
    haulerId: {
      name: 'Test Hauler',
      email: 'test@hauler.com'
    },
    clientId: {
      name: 'ABC Construction',
      email: 'info@abcconstruction.com'
    },
    status: 'pending',
    haulerRates: [
      { materialType: 'Gravel', rate: 45.00, unit: 'ton' },
      { materialType: 'Sand', rate: 35.50, unit: 'ton' }
    ],
    resaleRates: [
      { materialType: 'Gravel', rate: 55.00, unit: 'ton' },
      { materialType: 'Sand', rate: 42.75, unit: 'ton' }
    ],
    jobDetails: 'Highway 101 Expansion Project',
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-15T10:30:00Z'
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    haulerId: {
      name: 'Test Hauler',
      email: 'test@hauler.com'
    },
    clientId: {
      name: 'XYZ Developers',
      email: 'projects@xyzdevelopers.com'
    },
    status: 'approved',
    haulerRates: [
      { materialType: 'Concrete', rate: 65.00, unit: 'cubic yard' },
      { materialType: 'Asphalt', rate: 75.00, unit: 'ton' }
    ],
    resaleRates: [
      { materialType: 'Concrete', rate: 78.00, unit: 'cubic yard' },
      { materialType: 'Asphalt', rate: 90.00, unit: 'ton' }
    ],
    jobDetails: 'Downtown Office Complex',
    createdAt: '2023-04-20T14:15:00Z',
    updatedAt: '2023-04-22T09:45:00Z',
    approvedAt: '2023-04-22T09:45:00Z'
  },
  {
    _id: '60d21b4667d0d8992e610c87',
    haulerId: {
      name: 'Test Hauler',
      email: 'test@hauler.com'
    },
    clientId: {
      name: 'City Works Department',
      email: 'projects@cityworks.gov'
    },
    status: 'rejected',
    haulerRates: [
      { materialType: 'Fill Dirt', rate: 28.00, unit: 'cubic yard' },
      { materialType: 'Topsoil', rate: 45.00, unit: 'cubic yard' }
    ],
    resaleRates: [
      { materialType: 'Fill Dirt', rate: 35.00, unit: 'cubic yard' },
      { materialType: 'Topsoil', rate: 55.00, unit: 'cubic yard' }
    ],
    jobDetails: 'City Park Renovation',
    createdAt: '2023-06-01T08:20:00Z',
    updatedAt: '2023-06-03T16:10:00Z',
    geofence: {
      type: 'Circle',
      center: [4.734976, 51.8094848], // [longitude, latitude]
      radius: 1000 // 1km radius
    }
  }
];

export interface PurchaseOrderContextType {
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  error: string | null;
  createPurchaseOrder: (data: any) => Promise<void>;
  updatePurchaseOrder: (id: string, data: any) => Promise<void>;
  updatePurchaseOrderStatus: (poId: string, status: 'approved' | 'rejected') => Promise<void>;
  userRole: 'hauler' | 'client';
  useMockData: boolean;
  setUseMockData: (value: boolean) => void;
}

export const PurchaseOrderContext = createContext<PurchaseOrderContextType | undefined>(undefined);

export const PurchaseOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'hauler' | 'client'>('hauler');
  const [useMockData, setUseMockData] = useState(false);
  const navigate = useNavigate();

  // Get user role from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role);
    }

    // Check if mock data mode is enabled
    const mockDataEnabled = localStorage.getItem('useMockData');
    if (mockDataEnabled === 'true') {
      setUseMockData(true);
    }
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (useMockData) {
        // Use mock data
        console.log('Using mock purchase order data');
        setPurchaseOrders(mockPurchaseOrders);
      } else {
        // Try to fetch from API
        try {
          const response = await axios.get(`http://localhost:5000/api/purchase-orders/${userRole}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setPurchaseOrders(response.data);
        } catch (apiError) {
          console.error('API error, falling back to mock data:', apiError);
          setUseMockData(true);
          setPurchaseOrders(mockPurchaseOrders);
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch purchase orders';
      setError(errorMessage);
      console.error('Error fetching purchase orders:', err);
      
      // Fall back to mock data if there's an authentication error
      if (err.message === 'No authentication token found' || err.response?.status === 401) {
        console.log('Authentication error, using mock data');
        setUseMockData(true);
        setPurchaseOrders(mockPurchaseOrders);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, [userRole, useMockData]);

  const createPurchaseOrder = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        // Create a mock purchase order
        const newPO: PurchaseOrder = {
          _id: `mock-${Date.now()}`,
          haulerId: {
            name: 'Test Hauler',
            email: 'test@hauler.com'
          },
          clientId: {
            name: data.clientName || 'Mock Client',
            email: data.clientEmail || 'mock@client.com'
          },
          status: 'pending',
          haulerRates: data.haulerRates || [],
          resaleRates: data.resaleRates || [],
          jobDetails: data.jobDetails || 'Mock Job Details',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setPurchaseOrders([...purchaseOrders, newPO]);
        navigate('/purchase-orders');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.post('http://localhost:5000/api/purchase-orders', data, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPurchaseOrders([...purchaseOrders, response.data]);
      } catch (apiError) {
        console.error('API error, using mock data:', apiError);
        setUseMockData(true);
        
        // Create a mock purchase order
        const newPO: PurchaseOrder = {
          _id: `mock-${Date.now()}`,
          haulerId: {
            name: 'Test Hauler',
            email: 'test@hauler.com'
          },
          clientId: {
            name: data.clientName || 'Mock Client',
            email: data.clientEmail || 'mock@client.com'
          },
          status: 'pending',
          haulerRates: data.haulerRates || [],
          resaleRates: data.resaleRates || [],
          jobDetails: data.jobDetails || 'Mock Job Details',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setPurchaseOrders([...purchaseOrders, newPO]);
      }
      
      navigate('/purchase-orders');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create purchase order';
      setError(errorMessage);
      console.error('Error creating purchase order:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePurchaseOrder = async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        // Update mock purchase order
        const updatedPOs = purchaseOrders.map(po => {
          if (po._id === id) {
            return {
              ...po,
              ...data,
              updatedAt: new Date().toISOString()
            };
          }
          return po;
        });
        
        setPurchaseOrders(updatedPOs);
        navigate('/purchase-orders');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.patch(`http://localhost:5000/api/purchase-orders/${id}`, data, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPurchaseOrders(purchaseOrders.map(po => 
          po._id === id ? response.data : po
        ));
      } catch (apiError) {
        console.error('API error, using mock data:', apiError);
        setUseMockData(true);
        
        // Update mock purchase order
        const updatedPOs = purchaseOrders.map(po => {
          if (po._id === id) {
            return {
              ...po,
              ...data,
              updatedAt: new Date().toISOString()
            };
          }
          return po;
        });
        
        setPurchaseOrders(updatedPOs);
      }
      
      navigate('/purchase-orders');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update purchase order';
      setError(errorMessage);
      console.error('Error updating purchase order:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePurchaseOrderStatus = async (poId: string, status: 'approved' | 'rejected') => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        // Update mock purchase order status
        const updatedPOs = purchaseOrders.map(po => {
          if (po._id === poId) {
            return {
              ...po,
              status,
              updatedAt: new Date().toISOString(),
              ...(status === 'approved' ? { approvedAt: new Date().toISOString() } : {})
            };
          }
          return po;
        });
        
        setPurchaseOrders(updatedPOs);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.patch(`http://localhost:5000/api/purchase-orders/${poId}/status`, 
          { status },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setPurchaseOrders(purchaseOrders.map(po => 
          po._id === poId ? response.data : po
        ));
      } catch (apiError) {
        console.error('API error, using mock data:', apiError);
        setUseMockData(true);
        
        // Update mock purchase order status
        const updatedPOs = purchaseOrders.map(po => {
          if (po._id === poId) {
            return {
              ...po,
              status,
              updatedAt: new Date().toISOString(),
              ...(status === 'approved' ? { approvedAt: new Date().toISOString() } : {})
            };
          }
          return po;
        });
        
        setPurchaseOrders(updatedPOs);
      }
      
      await fetchPurchaseOrders();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update purchase order status';
      setError(errorMessage);
      console.error('Error updating purchase order status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PurchaseOrderContext.Provider
      value={{
        purchaseOrders,
        loading,
        error,
        createPurchaseOrder,
        updatePurchaseOrder,
        updatePurchaseOrderStatus,
        userRole,
        useMockData,
        setUseMockData
      }}
    >
      {children}
    </PurchaseOrderContext.Provider>
  );
};

export const usePurchaseOrders = () => {
  const context = useContext(PurchaseOrderContext);
  if (context === undefined) {
    throw new Error('usePurchaseOrders must be used within a PurchaseOrderProvider');
  }
  return context;
}; 