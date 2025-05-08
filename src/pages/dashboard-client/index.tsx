import MainLayout from '@/layouts/MainLayout'
import { withAuth } from '@/hocs/withAuth'
import { TokenPayload } from '@/utils/jwtUtils'

interface Props {
  user: TokenPayload
}

function DashboardClient({ user }: Props) {
  return (
    <MainLayout>
      <section className="py-16 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Dashboard do Cliente</h1>
      <p>User Logado: {user.email}</p>
      </section>
    </MainLayout>
  )
}

export default withAuth(DashboardClient)