import { useState, useCallback } from 'react';
import { getInventory, addInventoryItem, updateInventoryItem, getCenters } from '@/data/mockData';
import { Plus, X, AlertTriangle, Package } from 'lucide-react';
export default function Inventory() {
    const [inventory, setInventory] = useState(getInventory);
    const [showForm, setShowForm] = useState(false);
    const [filterCenter, setFilterCenter] = useState('');
    const centers = getCenters();
    const refresh = useCallback(() => setInventory(getInventory()), []);
    const [form, setForm] = useState({ itemName: '', quantity: '', unit: 'units', centerId: '', threshold: '' });
    const handleAdd = (e) => {
        e.preventDefault();
        addInventoryItem({
            itemName: form.itemName,
            quantity: parseInt(form.quantity),
            unit: form.unit,
            centerId: form.centerId,
            threshold: parseInt(form.threshold),
        });
        setForm({ itemName: '', quantity: '', unit: 'units', centerId: '', threshold: '' });
        setShowForm(false);
        refresh();
    };
    const handleUpdateQty = (id, newQty) => {
        if (newQty < 0)
            return;
        updateInventoryItem(id, { quantity: newQty });
        refresh();
    };
    const filtered = filterCenter ? inventory.filter(i => i.centerId === filterCenter) : inventory;
    const centerName = (id) => centers.find(c => c.id === id)?.name || id;
    return (<div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="command-header">Inventory Management</h1>
          <p className="system-label mt-1">{inventory.length} ITEMS TRACKED // {inventory.filter(i => i.quantity <= i.threshold).length} LOW STOCK</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filterCenter} onChange={e => setFilterCenter(e.target.value)} className="input-field text-xs w-48">
            <option value="">All Centers</option>
            {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'}>
            {showForm ? <><X className="w-4 h-4 mr-1 inline"/>Cancel</> : <><Plus className="w-4 h-4 mr-1 inline"/>Add Item</>}
          </button>
        </div>
      </header>

      {showForm && (<form onSubmit={handleAdd} className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span className="w-1.5 h-5 bg-warning rounded-full block"/>
            ADD INVENTORY ITEM
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="system-label mb-1.5 block">Item Name</label>
              <input value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} className="input-field" placeholder="e.g. Water Bottles" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Quantity</label>
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="input-field font-mono" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Unit</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="input-field">
                <option>units</option><option>kg</option><option>liters</option><option>packets</option>
              </select>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Center</label>
              <select value={form.centerId} onChange={e => setForm({ ...form, centerId: e.target.value })} className="input-field" required>
                <option value="">Select...</option>
                {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Low Threshold</label>
              <input type="number" value={form.threshold} onChange={e => setForm({ ...form, threshold: e.target.value })} className="input-field font-mono" required/>
            </div>
          </div>
          <button type="submit" className="btn-primary">Add to Inventory</button>
        </form>)}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr>
                <th className="table-header">Item</th>
                <th className="table-header">Center</th>
                <th className="table-header">Quantity</th>
                <th className="table-header">Unit</th>
                <th className="table-header">Threshold</th>
                <th className="table-header">Status</th>
                <th className="table-header">Updated</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
            const isLow = item.quantity <= item.threshold;
            return (<tr key={item.id} className={`hover:bg-secondary/20 transition-colors ${isLow ? 'bg-destructive/5' : ''}`}>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Package className={`w-3.5 h-3.5 ${isLow ? 'text-destructive' : 'text-muted-foreground'}`}/>
                        <span className="font-medium">{item.itemName}</span>
                      </div>
                    </td>
                    <td className="table-cell text-muted-foreground text-xs">{centerName(item.centerId)}</td>
                    <td className="table-cell font-mono font-bold">{item.quantity}</td>
                    <td className="table-cell text-muted-foreground text-xs">{item.unit}</td>
                    <td className="table-cell font-mono text-xs text-muted-foreground">{item.threshold}</td>
                    <td className="table-cell">
                      {isLow ? (<span className="flex items-center gap-1 text-destructive text-xs font-bold">
                          <AlertTriangle className="w-3 h-3"/>LOW STOCK
                        </span>) : (<span className="text-success text-xs font-medium">OK</span>)}
                    </td>
                    <td className="table-cell font-mono text-xs text-muted-foreground">{new Date(item.lastUpdated).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleUpdateQty(item.id, item.quantity - 10)} className="btn-secondary text-xs py-1 px-2">-10</button>
                        <button onClick={() => handleUpdateQty(item.id, item.quantity + 10)} className="btn-secondary text-xs py-1 px-2">+10</button>
                      </div>
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
