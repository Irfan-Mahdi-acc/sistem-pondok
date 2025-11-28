import jsPDF from 'jspdf'
import { getPDFLayoutByLembaga } from '@/actions/pdf-layout-actions'

const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.setAttribute('crossOrigin', 'anonymous')
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL('image/png')
      resolve(dataURL)
    }
    img.onerror = (error: Event | string) => {
      reject(error)
    }
    img.src = url
  })
}

export const addPDFHeader = async (doc: jsPDF, options: { title?: string, subtitle?: string, date?: string }, lembagaId?: string) => {
  const layout = await getPDFLayoutByLembaga(lembagaId || "")
  
  // Default settings if no layout found
  const settings = layout || {
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
    footerText: ""
  }

  // If rich text content is present, use html2canvas
  if (settings.content) {
    if (typeof window === 'undefined') return 30 // Server-side fallback

    try {
      const html2canvas = (await import('html2canvas')).default as any
      
      // Get actual page width from the PDF document
      const pageWidth = doc.internal.pageSize.width
      const pageWidthPx = Math.ceil((pageWidth / 25.4) * 96) // Convert mm to px (96 DPI)
      
      // Create container for HTML content
      const container = document.createElement('div')
      container.style.width = `${pageWidthPx}px`
      container.style.padding = '20px 40px'
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.backgroundColor = '#fff'
      
      // Pre-load logo as Base64 to ensure it renders
      let logoImgTag = ''
      if (settings.showLogo) {
         // Use settings.logoUrl if available, otherwise try lembaga's logo
         const logoUrl = settings.logoUrl || (layout?.lembaga?.logoUrl)
         
         if (logoUrl) {
           try {
             console.log("Loading logo from URL:", logoUrl)
             const logoBase64 = await getBase64ImageFromURL(logoUrl)
             const logoSizePx = (settings.logoSize / 25.4) * 96
             logoImgTag = `
               <div style="flex-shrink: 0;">
                 <img src="${logoBase64}" style="width: ${logoSizePx}px; height: ${logoSizePx}px; object-fit: contain;" />
               </div>
             `
             console.log("Logo loaded successfully, size:", logoSizePx, "px")
           } catch (e) {
             console.error("Failed to load logo for header from URL:", logoUrl, e)
           }
         } else {
           console.warn("No logo URL available (settings.logoUrl and lembaga.logoUrl are both empty)")
         }
      }
      
      // Build HTML structure matching the preview
      let htmlContent = `
        <style>
          #pdf-container-root {
            --background: #ffffff;
            --foreground: #000000;
            --card: #ffffff;
            --card-foreground: #000000;
            --popover: #ffffff;
            --popover-foreground: #000000;
            --primary: #000000;
            --primary-foreground: #ffffff;
            --secondary: #f1f5f9;
            --secondary-foreground: #000000;
            --muted: #f1f5f9;
            --muted-foreground: #64748b;
            --accent: #f1f5f9;
            --accent-foreground: #000000;
            --destructive: #ef4444;
            --border: #e2e8f0;
            --input: #e2e8f0;
            --ring: #94a3b8;
            color: #000000;
            background-color: #ffffff;
            width: 100%;
            box-sizing: border-box;
          }
          #pdf-container-root * {
            border-color: #000000 !important;
            outline-color: #000000 !important;
            color: inherit;
          }
        </style>
        <div id="pdf-container-root" style="display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 20px; border-bottom: 3px double black; padding-bottom: 10px; color: #000000; width: 100%;">
      `
      
      if (logoImgTag) {
         htmlContent += logoImgTag
      }
      
      htmlContent += `
          <div style="flex-grow: 1; text-align: center;">
            ${settings.content}
          </div>
        </div>
      `
      
      container.innerHTML = htmlContent
      document.body.appendChild(container)
      
      // Render to canvas
      const canvas = await html2canvas(container, {
        // @ts-ignore
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc: Document) => {
          // Sanitize the cloned document to remove modern CSS variables that html2canvas can't parse
          const root = clonedDoc.documentElement
          const body = clonedDoc.body
          
          // Remove all classes that might trigger Tailwind variables
          root.removeAttribute('class')
          body.removeAttribute('class')
          
          // Force override of common Tailwind variables to safe Hex values
          const safeStyle = `
            --background: #ffffff;
            --foreground: #000000;
            --primary: #000000;
            --primary-foreground: #ffffff;
            --muted: #f1f5f9;
            --muted-foreground: #64748b;
            --border: #e2e8f0;
            --input: #e2e8f0;
            --ring: #94a3b8;
            background-color: #ffffff;
            color: #000000;
          `
          
          root.setAttribute('style', safeStyle)
          body.setAttribute('style', safeStyle)
          
          // Also ensure the container in the clone has safe styles
          const clonedContainer = clonedDoc.getElementById('pdf-container-root')
          if (clonedContainer) {
            clonedContainer.style.backgroundColor = '#ffffff'
            clonedContainer.style.color = '#000000'
            clonedContainer.style.width = '100%'
          }
        }
      })
      
      document.body.removeChild(container)
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = pageWidth // Use full page width
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      
      // Add title/subtitle if provided (below the header)
      let currentY = imgHeight + 10
      const centerX = pageWidth / 2
      
      if (options.title) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.text(options.title, centerX, currentY, { align: 'center' })
        currentY += 7
      }

      if (options.subtitle) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text(options.subtitle, centerX, currentY, { align: 'center' })
        currentY += 5
      }

      if (options.date) {
        doc.setFontSize(10)
        doc.text(options.date, pageWidth - 10, currentY, { align: 'right' })
        currentY += 10
      }
      
      return currentY

    } catch (error) {
      console.error("Error rendering rich text header:", error)
      // Fallback to standard text rendering if html2canvas fails
    }
  }

  // Standard Text Rendering (Fallback or if no content)
  let currentY = 15
  const pageWidth = doc.internal.pageSize.width
  const centerX = pageWidth / 2

  // Logo
  if (settings.showLogo && settings.logoUrl) {
    try {
      const imgData = await getBase64ImageFromURL(settings.logoUrl)
      const logoSize = settings.logoSize || 30
      doc.addImage(imgData, 'PNG', 10, 10, logoSize, logoSize)
    } catch (e) {
      console.error('Error loading logo:', e)
    }
  }

  // Header Text (Yayasan)
  if (settings.headerText) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(settings.headerText.toUpperCase(), centerX, currentY, { align: 'center' })
    currentY += 6
  }

  // School Name
  if (settings.showPondokName && settings.schoolName) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(settings.pondokNameSize || 14)
    doc.text(settings.schoolName.toUpperCase(), centerX, currentY, { align: 'center' })
    currentY += 7
  }

  // Address
  if (settings.address) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    
    // Split address if too long
    const splitAddress = doc.splitTextToSize(settings.address, pageWidth - 60)
    doc.text(splitAddress, centerX, currentY, { align: 'center' })
    currentY += (splitAddress.length * 5)
  }

  // Contact Info
  const contacts = []
  if (settings.phone) contacts.push(`Telp: ${settings.phone}`)
  if (settings.email) contacts.push(`Email: ${settings.email}`)
  if (settings.website) contacts.push(`Web: ${settings.website}`)
  
  if (contacts.length > 0) {
    doc.setFontSize(9)
    doc.text(contacts.join(' | '), centerX, currentY, { align: 'center' })
    currentY += 6
  }

  // Line Separator
  currentY += 2
  doc.setLineWidth(0.5)
  doc.line(10, currentY, pageWidth - 10, currentY)
  currentY += 1
  doc.setLineWidth(0.2)
  doc.line(10, currentY, pageWidth - 10, currentY)
  currentY += 10

  // Document Title & Subtitle (passed in options)
  if (options.title) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(options.title, centerX, currentY, { align: 'center' })
    currentY += 7
  }

  if (options.subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(options.subtitle, centerX, currentY, { align: 'center' })
    currentY += 5
  }

  if (options.date) {
    doc.setFontSize(10)
    doc.text(options.date, pageWidth - 10, currentY, { align: 'right' })
    currentY += 10
  }

  return currentY
}

export const addPDFFooter = async (doc: jsPDF, lembagaId?: string) => {
  const layout = await getPDFLayoutByLembaga(lembagaId || "")
  const settings = layout || { footerText: "" }

  const pageCount = doc.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(100)
    
    // Footer Text
    if (settings.footerText) {
      doc.text(settings.footerText, 10, pageHeight - 10)
    }
    
    // Page Number
    doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' })
  }
}
