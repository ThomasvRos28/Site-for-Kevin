import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TicketSettings, ClientManagement, ApiSettings } from './AdminComponents'
import { NotificationSettings, GeneralSettings } from './AdminComponents2'
import './Administration.css'

// Mock data
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@company.com', role: 'Admin', status: 'Active', lastLogin: '2024-05-24' },
  { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'Manager', status: 'Active', lastLogin: '2024-05-23' },
  { id: '3', name: 'Bob Wilson', email: 'bob@company.com', role: 'User', status: 'Inactive', lastLogin: '2024-05-20' },
]

const mockClients = [
  { id: '1', name: 'ABC Corporation', email: 'contact@abc.com', phone: '+1-555-0123', status: 'Active', projects: 5 },
  { id: '2', name: 'XYZ Industries', email: 'info@xyz.com', phone: '+1-555-0456', status: 'Active', projects: 3 },
  { id: '3', name: 'Tech Solutions Ltd', email: 'support@techsolutions.com', phone: '+1-555-0789', status: 'Pending', projects: 1 },
]

const mockApiKeys = [
  { id: '1', name: 'Production API', key: 'pk_live_****1234', status: 'Active', created: '2024-01-15', lastUsed: '2024-05-24' },
  { id: '2', name: 'Development API', key: 'pk_test_****5678', status: 'Active', created: '2024-02-01', lastUsed: '2024-05-23' },
  { id: '3', name: 'Webhook Endpoint', key: 'wh_****9012', status: 'Inactive', created: '2024-03-10', lastUsed: '2024-04-15' },
]

const mockTicketCategories = [
  { id: '1', name: 'Material Request', defaultPriority: 'Medium', autoAssign: true },
  { id: '2', name: 'Equipment Issue', defaultPriority: 'High', autoAssign: false },
  { id: '3', name: 'Documentation', defaultPriority: 'Low', autoAssign: true },
]

type AdminSection = 'users' | 'tickets' | 'clients' | 'api' | 'notifications' | 'general'

const Administration = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<AdminSection>('users')

  // User Management State
  const [users, setUsers] = useState(mockUsers)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  // Client Management State
  const [clients, setClients] = useState(mockClients)
  const [showClientForm, setShowClientForm] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)

  // API Keys State
  const [apiKeys, setApiKeys] = useState(mockApiKeys)
  const [showApiForm, setShowApiForm] = useState(false)

  // Ticket Settings State
  const [ticketCategories, setTicketCategories] = useState(mockTicketCategories)
  const [showCategoryForm, setShowCategoryForm] = useState(false)

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    timezone: 'UTC-5',
    language: 'en',
    companyName: 'MaterialFlow Dashboard',
    logo: null as File | null,
    logoPreview: null as string | null
  })

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailTemplate: 'Default template for ticket notifications...',
    recipients: 'admin@company.com, manager@company.com',
    enableNotifications: true
  })

  const adminSections = [
    { id: 'users' as AdminSection, name: 'User & Role Management', icon: '👥' },
    { id: 'tickets' as AdminSection, name: 'Ticket Settings', icon: '🎫' },
    { id: 'clients' as AdminSection, name: 'Client & Project Management', icon: '🏢' },
    { id: 'api' as AdminSection, name: 'API & Integration Settings', icon: '🔗' },
    { id: 'notifications' as AdminSection, name: 'Notifications & Email Templates', icon: '📧' },
    { id: 'general' as AdminSection, name: 'General Settings', icon: '⚙️' },
  ]

  const handleAddUser = (userData: any) => {
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      status: 'Active',
      lastLogin: 'Never'
    }
    setUsers([...users, newUser])
    setShowUserForm(false)
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setShowUserForm(true)
  }

  const handleUpdateUser = (userData: any) => {
    setUsers(users.map(user =>
      user.id === editingUser.id ? { ...user, ...userData } : user
    ))
    setShowUserForm(false)
    setEditingUser(null)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId))
  }

  const handleAddClient = (clientData: any) => {
    const newClient = {
      id: Date.now().toString(),
      ...clientData,
      projects: 0
    }
    setClients([...clients, newClient])
    setShowClientForm(false)
  }

  const handleEditClient = (client: any) => {
    setEditingClient(client)
    setShowClientForm(true)
  }

  const handleUpdateClient = (clientData: any) => {
    setClients(clients.map(client =>
      client.id === editingClient.id ? { ...client, ...clientData } : client
    ))
    setShowClientForm(false)
    setEditingClient(null)
  }

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter(client => client.id !== clientId))
  }

  const handleAddApiKey = (apiData: any) => {
    const newApiKey = {
      id: Date.now().toString(),
      ...apiData,
      key: `pk_${apiData.name.toLowerCase()}_****${Math.random().toString(36).substr(2, 4)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never'
    }
    setApiKeys([...apiKeys, newApiKey])
    setShowApiForm(false)
  }

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId))
  }

  const handleAddTicketCategory = (categoryData: any) => {
    const newCategory = {
      id: Date.now().toString(),
      ...categoryData
    }
    setTicketCategories([...ticketCategories, newCategory])
    setShowCategoryForm(false)
  }

  const handleDeleteTicketCategory = (categoryId: string) => {
    setTicketCategories(ticketCategories.filter(cat => cat.id !== categoryId))
  }

  return (
    <div className="administration">
      <header className="admin-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <h1>Administration Panel</h1>
          <p>Manage system settings, users, and configurations</p>
        </div>
      </header>

      <div className="admin-container">
        <nav className="admin-sidebar">
          <h3>Settings</h3>
          <ul className="admin-nav">
            {adminSections.map(section => (
              <li key={section.id}>
                <button
                  className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="nav-icon">{section.icon}</span>
                  <span className="nav-text">{section.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="admin-content">
          {activeSection === 'users' && (
            <UserManagement
              users={users}
              showForm={showUserForm}
              editingUser={editingUser}
              onShowForm={() => setShowUserForm(true)}
              onHideForm={() => { setShowUserForm(false); setEditingUser(null) }}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeSection === 'tickets' && (
            <TicketSettings
              categories={ticketCategories}
              showForm={showCategoryForm}
              onShowForm={() => setShowCategoryForm(true)}
              onHideForm={() => setShowCategoryForm(false)}
              onAddCategory={handleAddTicketCategory}
              onDeleteCategory={handleDeleteTicketCategory}
            />
          )}

          {activeSection === 'clients' && (
            <ClientManagement
              clients={clients}
              showForm={showClientForm}
              editingClient={editingClient}
              onShowForm={() => setShowClientForm(true)}
              onHideForm={() => { setShowClientForm(false); setEditingClient(null) }}
              onAddClient={handleAddClient}
              onEditClient={handleEditClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
            />
          )}

          {activeSection === 'api' && (
            <ApiSettings
              apiKeys={apiKeys}
              showForm={showApiForm}
              onShowForm={() => setShowApiForm(true)}
              onHideForm={() => setShowApiForm(false)}
              onAddApiKey={handleAddApiKey}
              onDeleteApiKey={handleDeleteApiKey}
            />
          )}

          {activeSection === 'notifications' && (
            <NotificationSettings
              settings={notificationSettings}
              onUpdateSettings={setNotificationSettings}
            />
          )}

          {activeSection === 'general' && (
            <GeneralSettings
              settings={generalSettings}
              onUpdateSettings={setGeneralSettings}
            />
          )}
        </main>
      </div>
    </div>
  )
}

// User Management Component
const UserManagement = ({ users, showForm, editingUser, onShowForm, onHideForm, onAddUser, onEditUser, onUpdateUser, onDeleteUser }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'User'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      onUpdateUser(formData)
    } else {
      onAddUser(formData)
    }
    setFormData({ name: '', email: '', role: 'User' })
  }

  const handleEdit = (user: any) => {
    setFormData({ name: user.name, email: user.email, role: user.role })
    onEditUser(user)
  }

  const handleCancel = () => {
    setFormData({ name: '', email: '', role: 'User' })
    onHideForm()
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2>User & Role Management</h2>
        <button className="btn btn-primary" onClick={onShowForm}>
          Add New User
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="User">User</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingUser ? 'Update User' : 'Add User'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.lastLogin}</td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Administration