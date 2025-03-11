import React, { useState } from 'react';
import WorkerCrud from './WorkerCrud';
import MeterCrud from './MeterCrud';
import AdminSideBar from './AdminSideBar';
import InspectionCrud from './InspectionCrud';
import RoutineCrud from './RoutineCrud';
import useErrorNotifier from '../hooks/useErrorNotifier';
import Email from './Email';
import Analytics from './Analytics';

const AdminDashboard: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string>('Analytics');

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'WorkerCrud':
        return <WorkerCrud tab={'get'} />;
      case 'MeterCrud':
        return <MeterCrud tab={'get'} />;
      case 'WorkerCrud_add':
        return <WorkerCrud tab={'add'} />;
      case 'InspectionCrud':
        return <InspectionCrud tab={'get'} />;
      case 'RoutineCrud':
        return <RoutineCrud tab={'get'} />;
      case 'Email':
        return <Email />
      default:
        return <WorkerCrud tab={'get'} />;
    }
  };
  useErrorNotifier({ stateName: 'admin' });
  return (
    <div className="flex min-h-screen w-full mt-20 overflow-hidden justify-between bg-gray-900 text-white">
      <AdminSideBar selectedComponent={selectedComponent} setSelectedComponent={setSelectedComponent} />

      <div className="flex-1 p-6 overflow-auto bg-gray-900" >
        {renderComponent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
