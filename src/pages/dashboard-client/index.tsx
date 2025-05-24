import MainLayout from '@/layouts/MainLayout'
import { withClientAuth } from '@/hooks/withClientAuth'
import { TokenPayload } from '@/utils/jwtUtils'

interface Props {
  user: TokenPayload
}

function DashboardClient({ user }: Props) {
  return (
    <MainLayout>
      <section className="py-16 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Dashboard do Cliente</h1>
      </section>
    </MainLayout>
  )
}

export default withClientAuth(DashboardClient)