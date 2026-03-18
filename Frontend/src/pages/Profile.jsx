import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import DetailCard from '@/components/DetailCard';

const createFormFromUser = (user) => ({
    name: user?.name || '',
    phone: user?.phone || '',
    age: user?.age ?? '',
    gender: user?.gender || '',
    maritalStatus: user?.maritalStatus || '',
    address: {
        addressLine1: user?.address?.addressLine1 || '',
        addressLine2: user?.address?.addressLine2 || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        postalCode: user?.address?.postalCode || '',
        country: user?.address?.country || '',
    },
    idType: user?.idType || '',
    idNumber: user?.idNumber || '',
    idDocumentUrl: user?.idDocumentUrl || '',
    emergencyContactName: user?.emergencyContactName || '',
    emergencyContactPhone: user?.emergencyContactPhone || '',
    emergencyRelation: user?.emergencyRelation || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : '',
    experienceLevel: user?.experienceLevel || '',
});

export default function Profile() {
    const { user, updateUserSession } = useAuth();
    const [form, setForm] = useState(() => createFormFromUser(user));
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState('');
    const [pageSuccess, setPageSuccess] = useState('');

    useEffect(() => {
        setForm(createFormFromUser(user));
    }, [user]);

    const handleAddressChange = (key, value) => {
        setForm((current) => ({
            ...current,
            address: {
                ...current.address,
                [key]: value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setPageError('');
        setPageSuccess('');

        try {
            const payload = {
                name: form.name,
                phone: form.phone,
                age: form.age === '' ? null : Number(form.age),
                gender: form.gender,
                maritalStatus: form.maritalStatus,
                address: form.address,
                idType: form.idType,
                idNumber: form.idNumber,
                idDocumentUrl: form.idDocumentUrl,
                emergencyContactName: form.emergencyContactName,
                emergencyContactPhone: form.emergencyContactPhone,
                emergencyRelation: form.emergencyRelation,
                skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
                experienceLevel: form.experienceLevel,
            };

            const response = await api.patch('/auth/profile', payload);
            updateUserSession(response.data.data);
            setPageSuccess('Profile updated successfully');
        }
        catch (error) {
            setPageError(error.response?.data?.message || 'Unable to update profile');
        }
        finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
          <header>
            <h1 className="command-header">Profile</h1>
            <p className="system-label mt-1">PERSONNEL RECORD // UPDATE VOLUNTEER DETAILS</p>
          </header>

          {pageError && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">{pageError}</div>}
          {pageSuccess && <div className="text-xs text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-md">{pageSuccess}</div>}

          <div className="bg-card border border-border rounded-lg p-5 space-y-5">
            <div>
              <h3 className="system-label">Profile Overview</h3>
              <p className="text-sm text-muted-foreground mt-2">Review your current volunteer profile details before updating them.</p>
            </div>

            <ProfileSection
              title="Current Details"
              items={[
                  { label: 'Name', value: user?.name },
                  { label: 'Phone', value: user?.phone },
                  { label: 'Email', value: user?.email },
                  { label: 'Status', value: user?.status || 'unassigned' },
                  { label: 'Assigned Type', value: user?.assignedType || 'none' },
                  { label: 'Availability', value: user?.availability || 'available' },
              ]}
            />
          </div>

          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-5 space-y-6">
            <SectionTitle title="Basic Information"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required/></Field>
              <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field"/></Field>
              <Field label="Age"><input type="number" min="0" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input-field"/></Field>
              <Field label="Gender">
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </Field>
              <Field label="Marital Status">
                <select value={form.maritalStatus} onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })} className="input-field">
                  <option value="">Select marital status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </Field>
            </div>

            <SectionTitle title="Address"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Address Line 1"><input value={form.address.addressLine1} onChange={(e) => handleAddressChange('addressLine1', e.target.value)} className="input-field"/></Field>
              <Field label="Address Line 2"><input value={form.address.addressLine2} onChange={(e) => handleAddressChange('addressLine2', e.target.value)} className="input-field"/></Field>
              <Field label="City"><input value={form.address.city} onChange={(e) => handleAddressChange('city', e.target.value)} className="input-field"/></Field>
              <Field label="State"><input value={form.address.state} onChange={(e) => handleAddressChange('state', e.target.value)} className="input-field"/></Field>
              <Field label="Postal Code"><input value={form.address.postalCode} onChange={(e) => handleAddressChange('postalCode', e.target.value)} className="input-field"/></Field>
              <Field label="Country"><input value={form.address.country} onChange={(e) => handleAddressChange('country', e.target.value)} className="input-field"/></Field>
            </div>

            <SectionTitle title="Identity Documents"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="ID Type">
                <select value={form.idType} onChange={(e) => setForm({ ...form, idType: e.target.value })} className="input-field">
                  <option value="">Select ID type</option>
                  <option value="Aadhar">Aadhar</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </Field>
              <Field label="ID Number"><input value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} className="input-field"/></Field>
              <Field label="Document URL"><input value={form.idDocumentUrl} onChange={(e) => setForm({ ...form, idDocumentUrl: e.target.value })} className="input-field" placeholder="/uploads/id-card.png"/></Field>
            </div>

            <SectionTitle title="Emergency Contact"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Emergency Contact Name"><input value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} className="input-field"/></Field>
              <Field label="Emergency Phone"><input value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} className="input-field"/></Field>
              <Field label="Relation"><input value={form.emergencyRelation} onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })} className="input-field"/></Field>
            </div>

            <SectionTitle title="Volunteer Information"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Skills"><input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="input-field" placeholder="First Aid, Food Distribution"/></Field>
              <Field label="Experience Level">
                <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} className="input-field">
                  <option value="">Select level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Experienced">Experienced</option>
                </select>
              </Field>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
    );
}

function SectionTitle({ title }) {
    return <h3 className="system-label">{title}</h3>;
}

function Field({ label, children }) {
    return (
        <div>
          <label className="system-label mb-1.5 block">{label}</label>
          {children}
        </div>
    );
}

function ProfileSection({ title, items }) {
    return (
        <div className="space-y-3">
          <h3 className="system-label">{title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
                <DetailCard key={item.label} label={item.label} value={item.value || 'Not provided'}/>
            ))}
          </div>
        </div>
    );
}
