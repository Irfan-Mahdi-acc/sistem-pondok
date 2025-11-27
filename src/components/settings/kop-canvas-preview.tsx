'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type KOPCanvasPreviewProps = {
  showLogo: boolean
  logoUrl?: string
  logoSize: number
  content?: string
  headerText?: string
  schoolName?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  showPondokName: boolean
  pondokNameSize: number
}

export function KOPCanvasPreview({
  showLogo,
  logoUrl,
  logoSize,
  content,
  headerText,
  schoolName,
  address,
  phone,
  email,
  website,
  showPondokName,
  pondokNameSize
}: KOPCanvasPreviewProps) {
  
  // Calculate logo size in pixels (approximate for screen)
  const logoSizePx = (logoSize / 25.4) * 96

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview KOP</CardTitle>
        <CardDescription>
          Pratinjau tampilan kop surat pada dokumen PDF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 bg-gray-100 overflow-auto">
          <div 
            className="bg-white shadow-sm mx-auto relative"
            style={{
              width: '794px', // A4 width at 96 DPI
              minHeight: '200px',
              padding: '20px 40px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '20px',
              borderBottom: '3px double black' // Double line separator
            }}
          >
            {/* Logo Section */}
            {showLogo && (
              <div style={{ flexShrink: 0 }}>
                {logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    style={{ 
                      width: `${logoSizePx}px`, 
                      height: `${logoSizePx}px`,
                      objectFit: 'contain'
                    }} 
                  />
                ) : (
                  <div 
                    className="bg-gray-200 flex items-center justify-center text-gray-400 text-xs"
                    style={{ 
                      width: `${logoSizePx}px`, 
                      height: `${logoSizePx}px`,
                      borderRadius: '4px'
                    }}
                  >
                    Logo
                  </div>
                )}
              </div>
            )}

            {/* Content Section */}
            <div className="flex-grow text-center">
              {content ? (
                <div 
                  className="rich-text-content"
                  dangerouslySetInnerHTML={{ __html: content }} 
                  style={{ textAlign: 'center', width: '100%' }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1">
                  {headerText && (
                    <h3 className="font-bold text-lg uppercase leading-tight text-gray-900">
                      {headerText}
                    </h3>
                  )}
                  
                  {showPondokName && schoolName && (
                    <h2 
                      className="font-bold uppercase leading-tight text-black"
                      style={{ fontSize: `${pondokNameSize + 4}px` }}
                    >
                      {schoolName}
                    </h2>
                  )}

                  {address && (
                    <p className="text-sm text-gray-700 max-w-[80%] leading-snug">
                      {address}
                    </p>
                  )}

                  <div className="text-xs text-gray-600 flex flex-wrap justify-center gap-3 mt-1">
                    {phone && <span>Telp: {phone}</span>}
                    {email && <span>Email: {email}</span>}
                    {website && <span>Web: {website}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          * Preview ini adalah representasi visual. Tampilan aktual pada PDF mungkin sedikit berbeda.
        </p>
      </CardContent>
    </Card>
  )
}
