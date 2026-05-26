const EMPLOYEE_PERMISSION_MODULES = {
  dashboard: ['view'],
  turfs: ['view', 'edit', 'delete'],
  slots: ['view', 'create', 'edit', 'delete'],
  bookings: ['view', 'edit', 'delete'],
  checkins: ['view', 'edit']
};

function normalizePermissions(permissions = {}) {
  return Object.entries(EMPLOYEE_PERMISSION_MODULES).reduce((result, [moduleName, actions]) => {
    result[moduleName] = actions.reduce((modulePermissions, action) => {
      modulePermissions[action] = permissions?.[moduleName]?.[action] === true;
      return modulePermissions;
    }, {});
    if (actions.includes('view') && actions.some((action) => action !== 'view' && result[moduleName][action])) {
      result[moduleName].view = true;
    }
    return result;
  }, {});
}

function canAccessTurf(admin, turfId) {
  return admin.role === 'SUPER_ADMIN' || Boolean(admin.turfId && admin.turfId === turfId);
}

module.exports = { EMPLOYEE_PERMISSION_MODULES, normalizePermissions, canAccessTurf };
