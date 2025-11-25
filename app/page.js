import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './pages/DashboardPage'

export default function Home() {
  return (
    <MainLayout>
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    </MainLayout>
  )
}