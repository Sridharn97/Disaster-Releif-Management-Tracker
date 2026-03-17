// Mock data store with localStorage persistence
const STORE_PREFIX = 'drrt_';
function getStore(key, defaults) {
    const stored = localStorage.getItem(STORE_PREFIX + key);
    if (stored)
        return JSON.parse(stored);
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(defaults));
    return defaults;
}
function setStore(key, data) {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(data));
}
const defaultDisasters = [
    { id: 'd1', type: 'Flood', location: 'Chennai, Tamil Nadu', latitude: 13.0827, longitude: 80.2707, severity: 'Critical', status: 'Active', createdAt: '2024-04-20T08:30:00Z', description: 'Severe flooding in low-lying areas' },
    { id: 'd2', type: 'Earthquake', location: 'Kathmandu, Nepal', latitude: 27.7172, longitude: 85.3240, severity: 'High', status: 'Active', createdAt: '2024-04-19T14:15:00Z', description: '6.2 magnitude earthquake' },
    { id: 'd3', type: 'Cyclone', location: 'Odisha Coast', latitude: 19.8135, longitude: 85.8312, severity: 'High', status: 'Contained', createdAt: '2024-04-18T06:00:00Z', description: 'Category 3 cyclone approaching coast' },
    { id: 'd4', type: 'Fire', location: 'Uttarakhand Forest', latitude: 30.0668, longitude: 79.0193, severity: 'Medium', status: 'Active', createdAt: '2024-04-21T10:45:00Z', description: 'Forest fire spreading across 500 acres' },
    { id: 'd5', type: 'Landslide', location: 'Munnar, Kerala', latitude: 10.0889, longitude: 77.0595, severity: 'Low', status: 'Resolved', createdAt: '2024-04-15T16:20:00Z', description: 'Minor landslide on hill road' },
];
export function getDisasters() { return getStore('disasters', defaultDisasters); }
export function saveDisasters(data) { setStore('disasters', data); }
export function addDisaster(d) {
    const all = getDisasters();
    const newD = { ...d, id: 'd' + Date.now(), createdAt: new Date().toISOString() };
    all.push(newD);
    saveDisasters(all);
    return newD;
}
export function updateDisaster(id, updates) {
    const all = getDisasters().map(d => d.id === id ? { ...d, ...updates } : d);
    saveDisasters(all);
}
const defaultCenters = [
    { id: 'c1', name: 'Chennai Relief Hub', location: 'Anna Nagar, Chennai', latitude: 13.0850, longitude: 80.2101, contactPerson: 'Rajesh Kumar', phone: '+91-9876543210' },
    { id: 'c2', name: 'Nepal Aid Center', location: 'Patan, Kathmandu', latitude: 27.6710, longitude: 85.3189, contactPerson: 'Sita Devi', phone: '+977-9812345678' },
    { id: 'c3', name: 'Odisha Emergency Base', location: 'Bhubaneswar', latitude: 20.2961, longitude: 85.8245, contactPerson: 'Anil Mohanty', phone: '+91-9123456789' },
    { id: 'c4', name: 'Kerala Response Unit', location: 'Kochi', latitude: 9.9312, longitude: 76.2673, contactPerson: 'Priya Menon', phone: '+91-9456781234' },
];
export function getCenters() { return getStore('centers', defaultCenters); }
export function saveCenters(data) { setStore('centers', data); }
export function addCenter(c) {
    const all = getCenters();
    const newC = { ...c, id: 'c' + Date.now() };
    all.push(newC);
    saveCenters(all);
    return newC;
}
export function updateCenter(id, updates) {
    const all = getCenters().map(c => c.id === id ? { ...c, ...updates } : c);
    saveCenters(all);
}
const defaultInventory = [
    { id: 'i1', itemName: 'Food Packets', quantity: 500, unit: 'units', centerId: 'c1', threshold: 100, lastUpdated: '2024-04-20T10:00:00Z' },
    { id: 'i2', itemName: 'Water Bottles', quantity: 1200, unit: 'liters', centerId: 'c1', threshold: 200, lastUpdated: '2024-04-20T10:00:00Z' },
    { id: 'i3', itemName: 'Medical Kits', quantity: 80, unit: 'units', centerId: 'c1', threshold: 30, lastUpdated: '2024-04-20T10:00:00Z' },
    { id: 'i4', itemName: 'Blankets', quantity: 300, unit: 'units', centerId: 'c1', threshold: 50, lastUpdated: '2024-04-20T10:00:00Z' },
    { id: 'i5', itemName: 'Food Packets', quantity: 200, unit: 'units', centerId: 'c2', threshold: 100, lastUpdated: '2024-04-19T15:00:00Z' },
    { id: 'i6', itemName: 'Water Bottles', quantity: 50, unit: 'liters', centerId: 'c2', threshold: 200, lastUpdated: '2024-04-19T15:00:00Z' },
    { id: 'i7', itemName: 'Medical Kits', quantity: 150, unit: 'units', centerId: 'c3', threshold: 30, lastUpdated: '2024-04-18T08:00:00Z' },
    { id: 'i8', itemName: 'Blankets', quantity: 20, unit: 'units', centerId: 'c4', threshold: 50, lastUpdated: '2024-04-17T12:00:00Z' },
    { id: 'i9', itemName: 'Tents', quantity: 40, unit: 'units', centerId: 'c3', threshold: 15, lastUpdated: '2024-04-18T08:00:00Z' },
    { id: 'i10', itemName: 'First Aid Kits', quantity: 10, unit: 'units', centerId: 'c4', threshold: 20, lastUpdated: '2024-04-17T12:00:00Z' },
];
export function getInventory() { return getStore('inventory', defaultInventory); }
export function saveInventory(data) { setStore('inventory', data); }
export function addInventoryItem(item) {
    const all = getInventory();
    const newItem = { ...item, id: 'i' + Date.now(), lastUpdated: new Date().toISOString() };
    all.push(newItem);
    saveInventory(all);
    return newItem;
}
export function updateInventoryItem(id, updates) {
    const all = getInventory().map(i => i.id === id ? { ...i, ...updates, lastUpdated: new Date().toISOString() } : i);
    saveInventory(all);
}
const defaultVolunteers = [
    { id: 'v1', name: 'Amit Sharma', phone: '+91-9876543210', location: 'Chennai', availabilityStatus: 'Available', assignedCenter: '', assignedTask: '' },
    { id: 'v2', name: 'Priya Nair', phone: '+91-9123456780', location: 'Kochi', availabilityStatus: 'Deployed', assignedCenter: 'c4', assignedTask: 'Medical supply distribution' },
    { id: 'v3', name: 'Rahul Verma', phone: '+91-9567891234', location: 'Delhi', availabilityStatus: 'Available', assignedCenter: '', assignedTask: '' },
    { id: 'v4', name: 'Deepa Gupta', phone: '+91-9234567891', location: 'Bhubaneswar', availabilityStatus: 'Deployed', assignedCenter: 'c3', assignedTask: 'Cyclone evacuation support' },
    { id: 'v5', name: 'Suresh Patel', phone: '+91-9345678912', location: 'Mumbai', availabilityStatus: 'Unavailable', assignedCenter: '', assignedTask: '' },
    { id: 'v6', name: 'Meera Joshi', phone: '+91-9456789123', location: 'Kathmandu', availabilityStatus: 'Deployed', assignedCenter: 'c2', assignedTask: 'Earthquake rescue operations' },
];
export function getVolunteers() { return getStore('volunteers', defaultVolunteers); }
export function saveVolunteers(data) { setStore('volunteers', data); }
export function addVolunteer(v) {
    const all = getVolunteers();
    const newV = { ...v, id: 'v' + Date.now() };
    all.push(newV);
    saveVolunteers(all);
    return newV;
}
export function updateVolunteer(id, updates) {
    const all = getVolunteers().map(v => v.id === id ? { ...v, ...updates } : v);
    saveVolunteers(all);
}
const defaultDispatches = [
    { id: 'dp1', itemName: 'Food Packets', quantity: 100, fromCenter: 'c1', destination: 'Chennai, Tamil Nadu', destinationLat: 13.0827, destinationLng: 80.2707, assignedVolunteers: ['v1'], status: 'In Transit', createdAt: '2024-04-20T12:00:00Z' },
    { id: 'dp2', itemName: 'Medical Kits', quantity: 30, fromCenter: 'c2', destination: 'Kathmandu, Nepal', destinationLat: 27.7172, destinationLng: 85.3240, assignedVolunteers: ['v6'], status: 'Delivered', createdAt: '2024-04-19T16:00:00Z' },
    { id: 'dp3', itemName: 'Water Bottles', quantity: 500, fromCenter: 'c3', destination: 'Odisha Coast', destinationLat: 19.8135, destinationLng: 85.8312, assignedVolunteers: ['v4'], status: 'Pending', createdAt: '2024-04-21T09:00:00Z' },
];
export function getDispatches() { return getStore('dispatches', defaultDispatches); }
export function saveDispatches(data) { setStore('dispatches', data); }
export function createDispatch(d) {
    // Reduce inventory
    const inventory = getInventory();
    const item = inventory.find(i => i.centerId === d.fromCenter && i.itemName === d.itemName);
    if (!item || item.quantity < d.quantity)
        return null;
    item.quantity -= d.quantity;
    item.lastUpdated = new Date().toISOString();
    saveInventory(inventory);
    // Mark volunteers as deployed
    const volunteers = getVolunteers();
    d.assignedVolunteers.forEach(vId => {
        const vol = volunteers.find(v => v.id === vId);
        if (vol) {
            vol.availabilityStatus = 'Deployed';
            vol.assignedTask = `Dispatch: ${d.itemName} to ${d.destination}`;
        }
    });
    saveVolunteers(volunteers);
    // Create dispatch
    const all = getDispatches();
    const newD = { ...d, id: 'dp' + Date.now(), status: 'Pending', createdAt: new Date().toISOString() };
    all.push(newD);
    saveDispatches(all);
    return newD;
}
export function updateDispatchStatus(id, status) {
    const all = getDispatches().map(d => d.id === id ? { ...d, status } : d);
    saveDispatches(all);
    // If delivered, free up volunteers
    if (status === 'Delivered') {
        const dispatch = all.find(d => d.id === id);
        if (dispatch) {
            const volunteers = getVolunteers();
            dispatch.assignedVolunteers.forEach(vId => {
                const vol = volunteers.find(v => v.id === vId);
                if (vol) {
                    vol.availabilityStatus = 'Available';
                    vol.assignedTask = '';
                    vol.assignedCenter = '';
                }
            });
            saveVolunteers(volunteers);
        }
    }
}
