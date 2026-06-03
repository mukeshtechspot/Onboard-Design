import { useState, useMemo } from 'react';
import { Search, Plus, X, Users, UserX, CheckCircle2, MoreVertical, Trash2 } from 'lucide-react';

export interface StaffUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  email?: string;
  status: 'Active' | 'Inactive';
}

interface StaffManagerProps {
  staffUsers: StaffUser[];
  onChange: (users: StaffUser[]) => void;
}

const ROLES = ['Owner', 'Bar Entry(bouncer)', 'Waiter', 'Eventier', 'DJ', 'Valet Manager'];
const MAX_PER_ROLE = 5;

export default function StaffManager({ staffUsers, onChange }: StaffManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: '',
    email: '',
  });

  const filteredUsers = useMemo(() => {
    return staffUsers.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.phone.includes(searchTerm);
      const matchesRole = roleFilter === 'All Roles' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [staffUsers, searchTerm, roleFilter]);

  const getRoleCount = (role: string) => staffUsers.filter(u => u.role === role).length;

  const isRoleFull = (role: string) => role && getRoleCount(role) >= MAX_PER_ROLE;

  const handleCreate = () => {
    if (!formData.name || formData.phone.length !== 10 || !formData.role) return;
    if (formData.role === 'Valet Manager' && !formData.email) return;

    const newUser: StaffUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      email: formData.role === 'Valet Manager' ? formData.email : undefined,
      status: 'Active',
    };

    onChange([...staffUsers, newUser]);
    setIsModalOpen(false);
    setFormData({ name: '', phone: '', role: '', email: '' });
  };

  const handleDelete = (id: string) => {
    onChange(staffUsers.filter(u => u.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">User Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your team roles and access</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>



      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>All Roles</option>
            {ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">NAME</th>
                <th className="px-6 py-4 font-semibold">MOBILE NUMBER</th>
                <th className="px-6 py-4 font-semibold">ROLE</th>
                <th className="px-6 py-4 font-semibold text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</div>
                          {user.email && <div className="text-[10px] text-slate-500">{user.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.phone}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.role}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors" title="Delete User">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add New User</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter user name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: val });
                  }}
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                  <option value="" disabled>Select a role</option>
                  {ROLES.map(role => {
                    const count = getRoleCount(role);
                    return (
                      <option key={role} value={role}>
                        {role} ({count}/{MAX_PER_ROLE})
                      </option>
                    );
                  })}
                </select>
                {formData.role && isRoleFull(formData.role) && (
                  <p className="text-rose-500 text-xs mt-1.5 font-medium">
                    Maximum limit reached for {formData.role} role
                  </p>
                )}
              </div>

              {formData.role === 'Valet Manager' && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="valet@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={
                  !formData.name || 
                  formData.phone.length !== 10 || 
                  !formData.role || 
                  (formData.role === 'Valet Manager' && !formData.email) ||
                  isRoleFull(formData.role)
                }
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
