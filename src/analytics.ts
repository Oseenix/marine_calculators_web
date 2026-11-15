const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } }

export function initAnalytics() {
  if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId)) return false
  const script=document.createElement('script')
  script.async=true
  script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  document.head.appendChild(script)
  window.dataLayer=window.dataLayer||[]
  window.gtag=(...args:unknown[])=>window.dataLayer?.push(args)
  window.gtag('js',new Date())
  window.gtag('config',measurementId,{send_page_view:false})
  return true
}

export function trackCalculatorView(id:string,title:string) {
  if(!window.gtag)return
  window.gtag('event','page_view',{page_title:`${title} | Marine Calculators`,page_location:window.location.href,page_path:`${window.location.pathname}#${id}`})
  if(id!=='home'&&id!=='resources')window.gtag('event','calculator_view',{calculator_id:id,calculator_name:title})
}
