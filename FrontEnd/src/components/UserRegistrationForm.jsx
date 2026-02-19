import { useState } from 'react';
import './UserRegistrationForm.css';

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'VI', name: 'Virgin Islands' },
  { code: 'GU', name: 'Guam' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'MP', name: 'Northern Mariana Islands' }
];

const generateGuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const initialFormData = {
  gender: '',
  birth_date: '',
  name_first: '',
  name_last: '',
  document_ssn: '',
  document_id_card: '',
  document_license: '',
  document_passport: '',
  addresses: [
    {
      address_line_1: '',
      address_city: '',
      address_state: '',
      address_postal_code: '',
      address_country_code: 'US',
      type: 'primary'
    }
  ],
  emails: [{ email_address: '' }],
  phones: [{ phone_number: '' }]
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/evaluations';

function UserRegistrationForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [submittedData, setSubmittedData] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (index, field, value) => {
    setFormData(prev => {
      const newAddresses = [...prev.addresses];
      newAddresses[index] = { ...newAddresses[index], [field]: value };
      return { ...prev, addresses: newAddresses };
    });
  };

  const handleEmailChange = (index, value) => {
    setFormData(prev => {
      const newEmails = [...prev.emails];
      newEmails[index] = { email_address: value };
      return { ...prev, emails: newEmails };
    });
  };

  const handlePhoneChange = (index, value) => {
    setFormData(prev => {
      const newPhones = [...prev.phones];
      newPhones[index] = { phone_number: value };
      return { ...prev, phones: newPhones };
    });
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          address_line_1: '',
          address_city: '',
          address_state: '',
          address_postal_code: '',
          address_country_code: 'US',
          type: 'secondary'
        }
      ]
    }));
  };

  const removeAddress = (index) => {
    if (formData.addresses.length > 1) {
      setFormData(prev => ({
        ...prev,
        addresses: prev.addresses.filter((_, i) => i !== index)
      }));
    }
  };

  const addEmail = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, { email_address: '' }]
    }));
  };

  const removeEmail = (index) => {
    if (formData.emails.length > 1) {
      setFormData(prev => ({
        ...prev,
        emails: prev.emails.filter((_, i) => i !== index)
      }));
    }
  };

  const addPhone = () => {
    setFormData(prev => ({
      ...prev,
      phones: [...prev.phones, { phone_number: '' }]
    }));
  };

  const removePhone = (index) => {
    if (formData.phones.length > 1) {
      setFormData(prev => ({
        ...prev,
        phones: prev.phones.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    const externalEntityId = "person-entity"

    // Clean up empty optional fields and add auto-generated ID
    const cleanedData = {
      external_entity_id: externalEntityId,
      ...formData,
      document_id_card: formData.document_id_card || null,
      document_license: formData.document_license || null,
      document_passport: formData.document_passport || null
    };

    setSubmittedData(cleanedData);
    console.log('Form submitted:', cleanedData);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }

      setApiResponse(data);
      console.log('API Response:', data);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setSubmittedData(null);
    setApiResponse(null);
    setError(null);
  };

  // Check if we have an outcome to display
  const outcome = apiResponse?.summary?.outcome;
  const showOutcome = outcome && ['Approved', 'Manual Review', 'Denied'].includes(outcome);

  // If we have a valid outcome, show only the outcome page
  if (showOutcome) {
    return (
      <div className="form-container">
        <h1>Application Status</h1>

        {outcome === 'Approved' && (
          <section className="outcome-container outcome-approved">
            <h2>Application Approved</h2>
            <p>Congratulations! Your application has been approved.</p>
            {/* <button className="btn-new-application" onClick={handleReset}>
              Start New Application
            </button> */}
          </section>
        )}

        {outcome === 'Manual Review' && (
          <section className="outcome-container outcome-manual-review">
            <h2>Manual Review Required</h2>
            <p>Your application is under manual review. We will contact you shortly.</p>
            {/* <button className="btn-new-application" onClick={handleReset}>
              Start New Application
            </button> */}
          </section>
        )}

        {outcome === 'Denied' && (
          <section className="outcome-container outcome-denied">
            <h2>Application Denied</h2>
            <p>Unfortunately, your application has been denied.</p>
            {/* <button className="btn-new-application" onClick={handleReset}>
              Start New Application
            </button> */}
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="form-container">
      <h1>User Registration</h1>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <section className="form-section">
          <h2>Basic Information</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name_first">First Name *</label>
              <input
                type="text"
                id="name_first"
                name="name_first"
                value={formData.name_first}
                onChange={handleInputChange}
                placeholder="John"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name_last">Last Name *</label>
              <input
                type="text"
                id="name_last"
                name="name_last"
                value={formData.name_last}
                onChange={handleInputChange}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birth_date">Date of Birth (YYYY-MM-DD) *</label>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="form-section">
          <h2>Documents</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="document_ssn">SSN *</label>
              <input
                type="text"
                id="document_ssn"
                name="document_ssn"
                value={formData.document_ssn}
                onChange={handleInputChange}
                placeholder="123456789"
                maxLength="9"
                pattern="\d{9}"
                title="SSN must be 9 digits"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="document_id_card">ID Card</label>
              <input
                type="text"
                id="document_id_card"
                name="document_id_card"
                value={formData.document_id_card}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="document_license">Driver's License</label>
              <input
                type="text"
                id="document_license"
                name="document_license"
                value={formData.document_license}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label htmlFor="document_passport">Passport</label>
              <input
                type="text"
                id="document_passport"
                name="document_passport"
                value={formData.document_passport}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>
          </div>
        </section>

        {/* Addresses */}
        <section className="form-section">
          <div className="section-header">
            <h2>Addresses</h2>
            <button type="button" className="btn-add" onClick={addAddress}>
              + Add Address
            </button>
          </div>

          {formData.addresses.map((address, index) => (
            <div key={index} className="array-item">
              <div className="array-item-header">
                <h3>Address {index + 1}</h3>
                {formData.addresses.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeAddress(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    value={address.address_line_1}
                    onChange={(e) => handleAddressChange(index, 'address_line_1', e.target.value)}
                    placeholder="41 E. 11th"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={address.address_city}
                    onChange={(e) => handleAddressChange(index, 'address_city', e.target.value)}
                    placeholder="New York"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <select
                    value={address.address_state}
                    onChange={(e) => handleAddressChange(index, 'address_state', e.target.value)}
                    required
                  >
                    <option value="">Select State</option>
                    {US_STATES.map(state => (
                      <option key={state.code} value={state.code}>{state.name} ({state.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    value={address.address_postal_code}
                    onChange={(e) => handleAddressChange(index, 'address_postal_code', e.target.value)}
                    placeholder="10003"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Country Code *</label>
                  <input
                    type="text"
                    value={address.address_country_code}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={address.type}
                    onChange={(e) => handleAddressChange(index, 'type', e.target.value)}
                    required
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="mailing">Mailing</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Emails */}
        <section className="form-section">
          <div className="section-header">
            <h2>Email Addresses</h2>
            <button type="button" className="btn-add" onClick={addEmail}>
              + Add Email
            </button>
          </div>

          {formData.emails.map((email, index) => (
            <div key={index} className="array-item inline-item">
              <div className="form-group flex-grow">
                <label>Email {index + 1} *</label>
                <input
                  type="email"
                  value={email.email_address}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>
              {formData.emails.length > 1 && (
                <button
                  type="button"
                  className="btn-remove btn-remove-inline"
                  onClick={() => removeEmail(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </section>

        {/* Phones */}
        <section className="form-section">
          <div className="section-header">
            <h2>Phone Numbers</h2>
            <button type="button" className="btn-add" onClick={addPhone}>
              + Add Phone
            </button>
          </div>

          {formData.phones.map((phone, index) => (
            <div key={index} className="array-item inline-item">
              <div className="form-group flex-grow">
                <label>Phone {index + 1} *</label>
                <input
                  type="tel"
                  value={phone.phone_number}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                  placeholder="555-000-1234"
                  required
                />
              </div>
              {formData.phones.length > 1 && (
                <button
                  type="button"
                  className="btn-remove btn-remove-inline"
                  onClick={() => removePhone(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </section>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
            Reset
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

      {/* Loading indicator */}
      {isLoading && (
        <section className="loading-section">
          <div className="spinner"></div>
          <p>Processing your request...</p>
        </section>
      )}

      {/* Error display */}
      {error && (
        <section className="error-section">
          <h2>Error</h2>
          <p>{error}</p>
        </section>
      )}

      {/* Display submitted data */}
      {submittedData && !isLoading && (
        <section className="submitted-data">
          <h2>Submitted Data</h2>
          <pre>{JSON.stringify(submittedData, null, 2)}</pre>
        </section>
      )}
    </div>
  );
}

export default UserRegistrationForm;
