import { useState } from 'react'

// Notification Settings Component
export const NotificationSettings = ({ settings, onUpdateSettings }: any) => {
  const [formData, setFormData] = useState(settings)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateSettings(formData)
    alert('Notification settings updated successfully!')
  }

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, emailTemplate: e.target.value })
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2>Notifications & Email Templates</h2>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.enableNotifications}
              onChange={(e) => setFormData({ ...formData, enableNotifications: e.target.checked })}
            />
            Enable Email Notifications
          </label>
        </div>

        <div className="form-group">
          <label>Notification Recipients:</label>
          <input
            type="text"
            value={formData.recipients}
            onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
            placeholder="admin@company.com, manager@company.com"
            disabled={!formData.enableNotifications}
          />
          <small>Separate multiple emails with commas</small>
        </div>

        <div className="form-group">
          <label>Email Template:</label>
          <textarea
            value={formData.emailTemplate}
            onChange={handleTemplateChange}
            rows={10}
            placeholder="Enter your email template here..."
            disabled={!formData.enableNotifications}
          />
          <small>
            Available variables: {'{'}ticketId{'}'}, {'{'}clientName{'}'}, {'{'}status{'}'}, {'{'}description{'}'}
          </small>
        </div>

        <div className="notification-preview">
          <h4>Template Preview:</h4>
          <div className="preview-box">
            <strong>Subject:</strong> Ticket Update - #{'{'}ticketId{'}'}<br/>
            <strong>Body:</strong><br/>
            <div style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>
              {formData.emailTemplate.replace('{ticketId}', 'TK-001')
                .replace('{clientName}', 'ABC Corporation')
                .replace('{status}', 'In Progress')
                .replace('{description}', 'Material request for construction project')}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save Notification Settings
          </button>
          <button type="button" className="btn btn-secondary">
            Send Test Email
          </button>
        </div>
      </form>
    </div>
  )
}

// General Settings Component
export const GeneralSettings = ({ settings, onUpdateSettings }: any) => {
  const [formData, setFormData] = useState(settings)
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoPreview || null)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  console.log('GeneralSettings rendered with settings:', settings)
  console.log('Current formData:', formData)
  console.log('Current logoPreview:', logoPreview)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Save to localStorage for persistence across page reloads
    localStorage.setItem('materialflow-settings', JSON.stringify(formData))
    onUpdateSettings(formData)
    alert('General settings updated successfully! Logo will appear on the home page.')
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔄 File input changed')
    setUploadStatus('Processing...')

    const file = e.target.files?.[0]

    if (!file) {
      console.log('❌ No file selected')
      setUploadStatus('')
      return
    }

    console.log('📁 File selected:', file.name, file.type, file.size)
    setUploadStatus(`Selected: ${file.name}`)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type)
      setUploadStatus('❌ Please select an image file')
      e.target.value = ''
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size)
      setUploadStatus('❌ File too large (max 5MB)')
      e.target.value = ''
      return
    }

    console.log('✅ File validation passed, creating preview...')
    setUploadStatus('Creating preview...')

    // Update form data
    setFormData((prev: any) => ({ ...prev, logo: file }))

    // Create preview - simplified version
    const reader = new FileReader()

    reader.onload = () => {
      console.log('✅ FileReader success')
      const result = reader.result
      if (typeof result === 'string') {
        console.log('✅ Setting logo preview')
        setLogoPreview(result)
        // Update parent state to persist across navigation
        const updatedSettings = { ...formData, logo: file, logoPreview: result }
        onUpdateSettings(updatedSettings)
        // Save to localStorage immediately
        localStorage.setItem('materialflow-settings', JSON.stringify(updatedSettings))
        setUploadStatus('✅ Logo uploaded successfully! Check the home page to see it.')
      }
    }

    reader.onerror = () => {
      console.log('❌ FileReader error')
      setUploadStatus('❌ Error reading file')
    }

    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    const updatedSettings = { ...formData, logo: null, logoPreview: null }
    setFormData(updatedSettings)
    setLogoPreview(null)
    setUploadStatus('')
    // Update parent state
    onUpdateSettings(updatedSettings)
    // Reset the file input
    const fileInput = document.getElementById('logo-input') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const timezones = [
    'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6',
    'UTC-5', 'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1',
    'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8',
    'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' }
  ]

  return (
    <div className="section">
      <div className="section-header">
        <h2>General Settings</h2>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="settings-grid">
          <div className="settings-column">
            <h3>Company Information</h3>

            <div className="form-group">
              <label>Company Name:</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Your Company Name"
              />
            </div>

            <div className="form-group">
              <label>Company Logo:</label>
              <input
                id="logo-input"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ marginBottom: '1rem' }}
              />
              <button
                type="button"
                onClick={() => {
                  console.log('Test button clicked')
                  setLogoPreview('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvZ28gVGVzdDwvdGV4dD48L3N2Zz4=')
                  setUploadStatus('✅ Test preview loaded')
                }}
                className="btn btn-sm btn-secondary"
                style={{ marginRight: '1rem', fontSize: '0.8rem' }}
              >
                Test Preview
              </button>

              {uploadStatus && (
                <div style={{
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  backgroundColor: uploadStatus.includes('❌') ? '#ffebee' : '#e8f5e8',
                  color: uploadStatus.includes('❌') ? '#c62828' : '#2e7d32',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  border: `1px solid ${uploadStatus.includes('❌') ? '#f44336' : '#4caf50'}`
                }}>
                  {uploadStatus}
                </div>
              )}
              {logoPreview ? (
                <div className="logo-preview">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '100px',
                      objectFit: 'contain',
                      border: '1px solid #ddd',
                      borderRadius: '12px',
                      padding: '12px',
                      backgroundColor: '#f9f9f9',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Remove Logo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="logo-placeholder">
                  <div style={{
                    width: '200px',
                    height: '100px',
                    border: '2px dashed #ccc',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    No logo uploaded
                  </div>
                </div>
              )}
              <small>Recommended size: 200x100px, PNG or JPG format (max 5MB)</small>
            </div>
          </div>

          <div className="settings-column">
            <h3>Localization</h3>

            <div className="form-group">
              <label>Timezone:</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Language:</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>System Preferences</h3>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                defaultChecked
              />
              Enable automatic backups
            </label>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                defaultChecked
              />
              Send system maintenance notifications
            </label>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                defaultChecked
              />
              Enable audit logging
            </label>
          </div>

          <div className="form-group">
            <label>Session Timeout (minutes):</label>
            <select defaultValue="30">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="480">8 hours</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>Security Settings</h3>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                defaultChecked
              />
              Require two-factor authentication
            </label>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                defaultChecked
              />
              Force password reset every 90 days
            </label>
          </div>

          <div className="form-group">
            <label>Minimum Password Length:</label>
            <select defaultValue="8">
              <option value="6">6 characters</option>
              <option value="8">8 characters</option>
              <option value="10">10 characters</option>
              <option value="12">12 characters</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save General Settings
          </button>
          <button type="button" className="btn btn-secondary">
            Reset to Defaults
          </button>
        </div>
      </form>
    </div>
  )
}
