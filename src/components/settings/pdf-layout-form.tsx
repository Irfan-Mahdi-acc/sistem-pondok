'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Settings, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { upsertPDFLayout, getPDFLayoutByLembaga } from "@/actions/pdf-layout-actions"
import { useToast } from "@/components/ui/toast"
import { KOPCanvasPreview } from "./kop-canvas-preview"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { ImageUpload } from "@/components/ui/image-upload"

const formSchema = z.object({
  lembagaId: z.string().optional(),
  showLogo: z.boolean().optional(),
  logoUrl: z.string().optional(),
  logoSize: z.coerce.number().min(10).max(100).optional(),
  content: z.string().optional(), // New rich text content
  headerText: z.string().optional(),
  schoolName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  showPondokName: z.boolean().optional(),
  pondokNameSize: z.coerce.number().min(8).max(24).optional(),
  footerText: z.string().optional(),
})

type PDFLayoutFormProps = {
  lembagas: any[]
}

export function PDFLayoutForm({ lembagas }: PDFLayoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("global")
  const toast = useToast()
  
  // Load global settings on mount if active tab is global
  useEffect(() => {
    if (activeTab === "global") {
      loadGlobalSettings()
    }
  }, []) // Run once on mount

  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lembagaId: "",
      showLogo: true,
      logoUrl: "",
      logoSize: 30,
      content: "",
      headerText: "",
      schoolName: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      showPondokName: true,
      pondokNameSize: 14,
      footerText: "",
    },
  })

  const selectedLembagaId = form.watch("lembagaId")

  const handleLembagaChange = async (lembagaId: string) => {
    form.setValue("lembagaId", lembagaId)
    
    const layout = await getPDFLayoutByLembaga(lembagaId)
    if (layout) {
      form.reset({
        lembagaId: layout.lembagaId || "",
        showLogo: layout.showLogo,
        logoUrl: layout.logoUrl || "",
        logoSize: layout.logoSize,
        content: layout.content || "",
        headerText: layout.headerText || "",
        schoolName: layout.schoolName || "",
        address: layout.address || "",
        phone: layout.phone || "",
        email: layout.email || "",
        website: layout.website || "",
        showPondokName: layout.showPondokName,
        pondokNameSize: layout.pondokNameSize,
        footerText: layout.footerText || "",
      })
    } else {
      const lembaga = lembagas.find(l => l.id === lembagaId)
      if (lembaga) {
        form.reset({
          lembagaId,
          showLogo: true,
          logoUrl: lembaga.logoUrl || "",
          logoSize: 30,
          content: "",
          headerText: "",
          schoolName: lembaga.name || "",
          address: lembaga.address || "",
          phone: lembaga.phone || "",
          email: lembaga.email || "",
          website: "",
          showPondokName: true,
          pondokNameSize: 14,
          footerText: "",
        })
      }
    }
  }

  const loadGlobalSettings = async () => {
    const layout = await getPDFLayoutByLembaga("")
    if (layout) {
      form.reset({
        lembagaId: undefined,
        showLogo: layout.showLogo,
        logoUrl: layout.logoUrl || "",
        logoSize: layout.logoSize,
        content: layout.content || "",
        headerText: layout.headerText || "",
        schoolName: layout.schoolName || "",
        address: layout.address || "",
        phone: layout.phone || "",
        email: layout.email || "",
        website: layout.website || "",
        showPondokName: layout.showPondokName,
        pondokNameSize: layout.pondokNameSize,
        footerText: layout.footerText || "",
      })
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    const submitData = {
      ...values,
      lembagaId: activeTab === "global" ? "" : values.lembagaId || ""
    }
    const result = await upsertPDFLayout(submitData as any)
    setIsSubmitting(false)

    if (result.success) {
      toast.showToast("Pengaturan KOP berhasil disimpan", "success")
    } else {
      toast.showToast(result.error || "Gagal menyimpan pengaturan", "error")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Pengaturan KOP (Kop Surat)
        </CardTitle>
        <CardDescription>
          Atur kop surat untuk dokumen PDF - bisa umum atau per lembaga
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="global" onClick={() => loadGlobalSettings()}>
              KOP Umum
            </TabsTrigger>
            <TabsTrigger value="lembaga">KOP Per Lembaga</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="global" className="mt-0">
                <div className="mb-4 p-4 bg-muted/50 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <strong>KOP Umum</strong> akan digunakan untuk dokumen-dokumen umum pondok yang tidak spesifik ke lembaga tertentu.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="lembaga" className="mt-0">
                <div className="mb-4 p-4 bg-muted/50 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <strong>KOP Per Lembaga</strong> akan digunakan untuk dokumen spesifik lembaga seperti raport, sertifikat, dll.
                  </p>
                </div>
                
                <FormField
                  control={form.control}
                  name="lembagaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Lembaga</FormLabel>
                      <Select onValueChange={handleLembagaChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih lembaga untuk diatur KOP-nya" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lembagas.map((lembaga) => (
                            <SelectItem key={lembaga.id} value={lembaga.id}>
                              {lembaga.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {(activeTab === "global" || selectedLembagaId) && (
                <>
                  {/* Canvas Preview */}
                  <KOPCanvasPreview
                    showLogo={form.watch("showLogo") ?? true}
                    logoUrl={form.watch("logoUrl")}
                    logoSize={form.watch("logoSize") ?? 30}
                    content={form.watch("content")}
                    headerText={form.watch("headerText")}
                    schoolName={form.watch("schoolName")}
                    address={form.watch("address")}
                    phone={form.watch("phone")}
                    email={form.watch("email")}
                    website={form.watch("website")}
                    showPondokName={form.watch("showPondokName") ?? true}
                    pondokNameSize={form.watch("pondokNameSize") ?? 14}
                  />

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Pengaturan Logo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="showLogo"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Tampilkan Logo</FormLabel>
                              <FormDescription>
                                Tampilkan logo di header PDF
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="logoSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ukuran Logo (mm)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormControl>
                              <ImageUpload 
                                value={field.value} 
                                onChange={field.onChange}
                                onRemove={() => field.onChange("")}
                                label="Logo KOP"
                              />
                            </FormControl>
                            <FormDescription>
                              Upload logo untuk KOP. Kosongkan untuk menggunakan logo lembaga default.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Konten KOP (Rich Text)</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Edit Tampilan KOP</FormLabel>
                            <FormControl>
                              <RichTextEditor 
                                value={field.value || ""} 
                                onChange={field.onChange}
                                placeholder="Ketik isi KOP di sini..."
                              />
                            </FormControl>
                            <FormDescription>
                              Gunakan editor ini untuk mengatur teks, font, ukuran, dan posisi. Mendukung teks Arab.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Pengaturan Footer</h3>
                    <FormField
                      control={form.control}
                      name="footerText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teks Footer (Opsional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Teks tambahan di footer dokumen" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Menyimpan..." : "Simpan Pengaturan"}
                  </Button>
                </>
              )}
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  )
}
