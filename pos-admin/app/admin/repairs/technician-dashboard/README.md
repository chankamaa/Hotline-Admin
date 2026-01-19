# Technician Dashboard

## Overview

The Technician Dashboard is a dedicated interface designed exclusively for users with the **technician** role. This dashboard provides technicians with real-time visibility into their workload, performance metrics, and job assignments.

## Features

### 🔒 Role-Based Access Control
- **Accessible only to technicians**: Only users with the `technician` role can access this page
- **Automatic redirection**: Non-technician users attempting to access this page are redirected to `/admin/dashboard`
- **Protected route**: Unauthenticated users are redirected to `/admin/login`

### 📊 Dashboard Components
- **My Assigned Jobs**: View only jobs assigned to the logged-in technician via the `/api/v1/repairs/my-jobs` endpoint
- **Real-time Statistics**: 
  - Total assigned jobs
  - Pending jobs count
  - In-progress jobs count
  - Ready jobs count
  - Completed jobs count

- **Job Status Filtering**: Filter jobs by status:
  - All Jobs
  - Pending
  - Assigned
  - In Progress
  - Ready
  - Completed

- **Job Details View**: Click any job to see complete details including:
  - Customer information (name, phone, email)
  - Device details (type, brand, model, serial number)
  - Problem description
  - Diagnosis and repair notes
  - Cost breakdown (estimated, advance, balance due)
  - Timeline (created, assigned, expected completion)

- **Quick Actions**:
  - **Start Working**: One-click button to change job status from ASSIGNED/PENDING to IN_PROGRESS
  - Jobs automatically update after status changes

### 🚀 Automatic Login Redirect
When a technician logs in, they are automatically redirected to this dashboard instead of the main admin dashboard. This ensures technicians immediately see the information most relevant to their role.

## Technical Implementation

### File Structure
```
app/admin/repairs/technician-dashboard/
├── page.tsx                      # Route page with role-based access control
├── technician-dashboard.tsx      # Main dashboard component
└── README.md                     # This file
```

### Key Components

#### 1. `page.tsx` - Route Protection
```tsx
// Checks user role and redirects non-technicians
useEffect(() => {
  if (!loading && user && !hasRole(user, ["technician"])) {
    router.replace("/admin/dashboard");
  }
}, [loading, user, router]);
```

#### 2. `technician-dashboard.tsx` - Main Dashboard Component
```tsx
// Fetches only jobs assigned to the logged-in technician
useEffect(() => {
  const fetchMyJobs = async () => {
    const response = await repairApi.getMyJobs();
    setJobs(response.data.repairs || []);
  };
  if (user) fetchMyJobs();
}, [user]);
```

The component uses the `repairApi.getMyJobs()` endpoint which automatically fetches only the jobs assigned to the currently authenticated technician based on their user session.

#### 2. Role-Based Routing
The following files were updated to implement automatic technician routing:

- **`app/admin/login/page.tsx`**: Redirects technicians to their dashboard upon login
- **`providers/providers.tsx`**: Handles role-based redirects in the AuthProvider
- **`app/admin/page.tsx`**: Routes technicians to their dashboard from the admin root
- **`app/admin/dashboard/page.tsx`**: Redirects technicians who somehow reach the main dashboard
- **`components/sidebar-config.ts`**: Adds technician-specific navigation menu

### Access Control Functions

The dashboard uses two key functions from `@/lib/acl`:

1. **`hasRole(user, roles)`**: Checks if user has one of the specified roles
   ```tsx
   hasRole(user, ["technician"]) // Returns true for technicians
   ```

2. **`can(user, permission)`**: Checks if user has a specific permission
   ```tsx
   can(user, "VIEW_ASSIGNED_REPAIRS") // Returns true if user has permission
   ```

## User Experience Flow

### For Technicians
1. **Login** → Automatically redirected to `/admin/repairs/technician-dashboard`
2. **Access admin root** (`/admin`) → Redirected to technician dashboard
3. **Try to access main dashboard** → Redirected back to technician dashboard
4. **See dedicated menu** → Sidebar shows "My Dashboard" with technician-specific items

### For Other Roles (Admin, Manager, Cashier)
1. **Login** → Redirected to `/admin/dashboard` (main dashboard)
2. **Try to access technician dashboard** → Redirected back to main dashboard
3. **See standard menu** → Sidebar shows all role-appropriate navigation items

## Permissions

The technician dashboard is associated with these permissions:
- `VIEW_ASSIGNED_REPAIRS`: View repairs assigned to the technician
- `UPDATE_REPAIR_STATUS`: Update the status of repair jobs
- `MANAGE_REPAIR_JOBS`: Full management of repair jobs (for managers)

## Navigation

The technician dashboard is integrated into the sidebar navigation:
- Visible only to users with the `technician` role
- Appears under "My Dashboard" section
- Icon: Wrench (🔧)

## Security Considerations

### Multiple Layers of Protection
1. **Client-side role check**: Immediate redirect for non-technicians
2. **Loading state**: Prevents flash of unauthorized content
3. **Auth provider check**: Validates authentication on every route change
4. **Backend validation**: API endpoints should also verify user roles

### Best Practices Implemented
- ✅ Role checking happens on component mount and when auth state changes
- ✅ Loading states prevent unauthorized content flash
- ✅ Null rendering when user doesn't have access
- ✅ Consistent use of `router.replace()` to prevent back button issues

## Extending the Dashboard

### Adding New Features
To add new features to the technician dashboard:

1. **Modify `technician-dashboard.tsx`**: Add new UI components or data fetching
2. **Update permissions** (if needed): Add new permission constants in `lib/permissions.ts`
3. **Add API integration**: Use the repair API functions from `lib/api/repairApi.ts`

### Available API Endpoints for Technicians
```tsx
// Get my assigned jobs
repairApi.getMyJobs({ status: 'IN_PROGRESS' })

// Start working on a job
repairApi.start(jobId)

// Complete a job with parts and labor
repairApi.complete(jobId, {
  laborCost: 50,
  partsUsed: [{ productId: '123', quantity: 1 }],
  diagnosisNotes: 'Screen was cracked',
  repairNotes: 'Replaced screen successfully'
})

// Get single job details
repairApi.getById(jobId)
```

### Example: Adding Job Completion Feature
```tsx
const handleCompleteJob = async (jobId: string) => {
  try {
    await repairApi.complete(jobId, {
      laborCost: 50,
      diagnosisNotes: 'Issue identified',
      repairNotes: 'Fixed successfully'
    });
    // Refresh jobs list
    const response = await repairApi.getMyJobs();
    setJobs(response.data.repairs);
  } catch (err) {
    console.error('Error completing job:', err);
  }
};
```

## Testing

### Test Scenarios
1. **✅ Technician Login**: Should redirect to technician dashboard
2. **✅ Admin Login**: Should redirect to main dashboard
3. **✅ Direct URL Access**: Technicians accessing `/admin/dashboard` should be redirected
4. **✅ Unauthorized Access**: Non-technicians accessing technician dashboard should be redirected
5. **✅ No Auth**: Unauthenticated users should be redirected to login

### Manual Testing
```bash
# 1. Login as technician
# Expected: Redirect to /admin/repairs/technician-dashboard

# 2. Login as admin
# Expected: Redirect to /admin/dashboard

# 3. As technician, navigate to /admin/dashboard
# Expected: Redirect back to /admin/repairs/technician-dashboard

# 4. As admin, navigate to /admin/repairs/technician-dashboard
# Expected: Redirect to /admin/dashboard
```

## Troubleshooting

### Issue: Technician sees main dashboard instead of technician dashboard
**Solution**: Check that `user.role` is set to `"technician"` (case-insensitive) in the user object returned from the API.

### Issue: Infinite redirect loop
**Solution**: Ensure the role check in `hasRole()` function properly handles the user role format (string vs array).

### Issue: Dashboard shows briefly before redirect
**Solution**: Ensure loading state is properly checked before rendering content. The component should return `null` or a loading spinner during the loading phase.

## Future Enhancements

- [ ] Real-time job assignment notifications
- [ ] Performance analytics and trends
- [ ] Job priority management
- [ ] Time tracking integration
- [ ] Mobile-responsive optimizations
- [ ] Export performance reports
- [ ] Integration with inventory for parts tracking

## Related Files

- `lib/acl.ts` - Access control functions
- `lib/permissions.ts` - Permission constants
- `providers/providers.tsx` - Authentication context
- `components/sidebar-config.ts` - Navigation configuration
- `lib/api/repairApi.ts` - Repair-related API functions

## Support

For issues or questions about the technician dashboard, please refer to:
- Project documentation
- Role-based access control guidelines
- API documentation for repair endpoints
