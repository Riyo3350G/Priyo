// assets
import { DashboardOutlined, ProjectOutlined } from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  ProjectOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'projects',
      title: 'Projects',
      type: 'item',
      url: '/dashboard/projects',
      icon: icons.ProjectOutlined,
      breadcrumbs: false
    },
    {
      id: 'tickets',
      title: 'Tickets',
      type: 'item',
      url: '/dashboard/tickets',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
