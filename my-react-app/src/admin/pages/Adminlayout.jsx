import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
    return (
        <div className="flex min-h-screen bg-[#FAFAF9]">
            <AdminSidebar />
            <main className="flex-1 min-w-0 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;