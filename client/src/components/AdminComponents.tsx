import { useState } from 'react'

// Ticket Settings Component
export const TicketSettings = ({ categories, showForm, onShowForm, onHideForm, onAddCategory, onDeleteCategory }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    defaultPriority: 'Medium',
    autoAssign: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddCategory(formData)
    setFormData({ name: '', defaultPriority: 'Medium', autoAssign: false })
  }

  const handleCancel = () => {
    setFormData({ name: '', defaultPriority: 'Medium', autoAssign: false })
    onHideForm()
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2>Ticket Settings</h2>
        <button className="btn btn-primary" onClick={onShowForm}>
          Add Category
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Add New Ticket Category</h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>Category Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Default Priority:</label>
              <select
                value={formData.defaultPriority}
                onChange={(e) => setFormData({ ...formData, defaultPriority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.autoAssign}
                  onChange={(e) => setFormData({ ...formData, autoAssign: e.target.checked })}
                />
                Auto-assign tickets
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Add Category
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
              <th>Category Name</th>
              <th>Default Priority</th>
              <th>Auto-assign</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category: any) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>
                  <span className={`priority priority-${category.defaultPriority.toLowerCase()}`}>
                    {category.defaultPriority}
                  </span>
                </td>
                <td>{category.autoAssign ? 'Yes' : 'No'}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDeleteCategory(category.id)}
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

// Client Management Component
export const ClientManagement = ({ clients, showForm, editingClient, onShowForm, onHideForm, onAddClient, onEditClient, onUpdateClient, onDeleteClient }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingClient) {
      onUpdateClient(formData)
    } else {
      onAddClient(formData)
    }
    setFormData({ name: '', email: '', phone: '', status: 'Active' })
  }

  const handleEdit = (client: any) => {
    setFormData({ name: client.name, email: client.email, phone: client.phone, status: client.status })
    onEditClient(client)
  }

  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '', status: 'Active' })
    onHideForm()
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2>Client & Project Management</h2>
        <button className="btn btn-primary" onClick={onShowForm}>
          Add New Client
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>Company Name:</label>
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
              <label>Phone:</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingClient ? 'Update Client' : 'Add Client'}
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
              <th>Company Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Projects</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client: any) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td>{client.phone}</td>
                <td>
                  <span className={`status ${client.status.toLowerCase()}`}>
                    {client.status}
                  </span>
                </td>
                <td>{client.projects}</td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEdit(client)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDeleteClient(client.id)}
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

// API Settings Component
export const ApiSettings = ({ apiKeys, showForm, onShowForm, onHideForm, onAddApiKey, onDeleteApiKey }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active'
  })

  const [webhookSettings, setWebhookSettings] = useState({
    url: 'https://api.example.com/webhook',
    secret: '',
    events: ['ticket.created', 'ticket.updated']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddApiKey(formData)
    setFormData({ name: '', status: 'Active' })
  }

  const handleCancel = () => {
    setFormData({ name: '', status: 'Active' })
    onHideForm()
  }

  const handleWebhookUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Webhook settings updated successfully!')
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2>API & Integration Settings</h2>
        <button className="btn btn-primary" onClick={onShowForm}>
          Generate API Key
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Generate New API Key</h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>API Key Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Production API, Development API"
                required
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Generate Key
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <h3>API Keys</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Key</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last Used</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key: any) => (
              <tr key={key.id}>
                <td>{key.name}</td>
                <td><code>{key.key}</code></td>
                <td>
                  <span className={`status ${key.status.toLowerCase()}`}>
                    {key.status}
                  </span>
                </td>
                <td>{key.created}</td>
                <td>{key.lastUsed}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDeleteApiKey(key.id)}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="form-container">
        <h3>Webhook Configuration</h3>
        <form onSubmit={handleWebhookUpdate} className="form">
          <div className="form-group">
            <label>Webhook URL:</label>
            <input
              type="url"
              value={webhookSettings.url}
              onChange={(e) => setWebhookSettings({ ...webhookSettings, url: e.target.value })}
              placeholder="https://your-app.com/webhook"
            />
          </div>
          <div className="form-group">
            <label>Secret Key:</label>
            <input
              type="password"
              value={webhookSettings.secret}
              onChange={(e) => setWebhookSettings({ ...webhookSettings, secret: e.target.value })}
              placeholder="Optional webhook secret"
            />
          </div>
          <div className="form-group">
            <label>Events:</label>
            <div className="checkbox-group">
              {['ticket.created', 'ticket.updated', 'ticket.deleted', 'user.created'].map(event => (
                <label key={event}>
                  <input
                    type="checkbox"
                    checked={webhookSettings.events.includes(event)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setWebhookSettings({
                          ...webhookSettings,
                          events: [...webhookSettings.events, event]
                        })
                      } else {
                        setWebhookSettings({
                          ...webhookSettings,
                          events: webhookSettings.events.filter(e => e !== event)
                        })
                      }
                    }}
                  />
                  {event}
                </label>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Update Webhook Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
