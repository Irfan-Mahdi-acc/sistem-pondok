import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAppSettings } from "@/actions/settings-actions"
import { getPondokProfile } from "@/actions/pondok-profile-actions"
import { getLembagas } from "@/actions/lembaga-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppSettingsForm } from "@/components/settings/app-settings-form"
import { PondokProfileForm } from "@/components/settings/pondok-profile-form"
import { PDFLayoutForm } from "@/components/settings/pdf-layout-form"

export default async function SettingsPage() {
  const session = await auth()

  // Only Super Admin can access
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  const [appSettings, pondokProfile, lembagas] = await Promise.all([
    getAppSettings(),
    getPondokProfile(),
    getLembagas()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan aplikasi dan profil pondok (hanya Super Admin)
        </p>
      </div>

      <Tabs defaultValue="app" className="space-y-4">
        <TabsList>
          <TabsTrigger value="app">Pengaturan Aplikasi</TabsTrigger>
          <TabsTrigger value="pondok">Profil Pondok</TabsTrigger>
          <TabsTrigger value="pdf">Layout PDF</TabsTrigger>
        </TabsList>

        {/* Tab 1: Pengaturan Aplikasi */}
        <TabsContent value="app" className="space-y-4">
          <AppSettingsForm appSettings={appSettings} />
        </TabsContent>

        {/* Tab 2: Profil Pondok */}
        <TabsContent value="pondok" className="space-y-4">
          <PondokProfileForm pondokProfile={pondokProfile} />
        </TabsContent>

        {/* Tab 3: Layout PDF */}
        <TabsContent value="pdf" className="space-y-4">
          <PDFLayoutForm lembagas={lembagas} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
