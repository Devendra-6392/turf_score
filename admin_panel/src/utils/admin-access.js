export const permissionModules = [
  { key: 'dashboard', label: 'Dashboard', actions: ['view'] },
  { key: 'turfs', label: 'Turf details', actions: ['view', 'edit', 'delete'] },
  { key: 'slots', label: 'Availability slots', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'bookings', label: 'Bookings', actions: ['view', 'edit', 'delete'] },
  { key: 'checkins', label: 'QR check-ins', actions: ['view', 'edit'] }
];

export const emptyPermissions = () =>
  permissionModules.reduce((permissions, module) => {
    permissions[module.key] = module.actions.reduce((actions, action) => {
      actions[action] = false;
      return actions;
    }, {});
    return permissions;
  }, {});

export const normalizePermissions = (permissions = {}) => {
  const normalized = emptyPermissions();
  permissionModules.forEach((module) => {
    module.actions.forEach((action) => {
      normalized[module.key][action] = permissions?.[module.key]?.[action] === true;
    });
    if (module.actions.some((action) => action !== 'view' && normalized[module.key][action])) {
      normalized[module.key].view = true;
    }
  });
  return normalized;
};

export const hasPermission = (admin, resource, action = 'view') => {
  if (!admin) return false;
  if (admin.role === 'SUPER_ADMIN' || admin.role === 'TURF_ADMIN') return true;
  return admin.permissions?.[resource]?.[action] === true;
};

export const authHeaders = (json = false) => ({
  ...(json ? { 'Content-Type': 'application/json' } : {}),
  Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`
});

export const authFetcher = async (url) => {
  const response = await fetch(url, { headers: authHeaders() });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
};
