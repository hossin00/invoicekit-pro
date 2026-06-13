import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import Onboarding from './components/Onboarding'
import App from './App'

const DONE_KEY = 'invoicekit-pro_onboarded_v1'
type Phase = 'splash' | 'onboard' | 'app'

export default function AppWrapper() {
  const [phase, setPhase] = useState<Phase>('splash')
  const features = ["Professional invoice PDF", "Client and product catalog", "Payment tracking", "Tax calculation"]
  return (
    <>
      {phase === 'splash' && <SplashScreen onDone={()=>setPhase(localStorage.getItem(DONE_KEY)?'app':'onboard')} color1="#eab308" color2="#ca8a04" emoji="🧾" name="InvoiceKit Pro" tagline="Professional invoice builder and tracker"/>}
      {phase === 'onboard' && <Onboarding onDone={()=>{localStorage.setItem(DONE_KEY,'1');setPhase('app')}} color1="#eab308" emoji="🧾" name="InvoiceKit Pro" features={features}/>}
      {phase === 'app' && <App/>}
    </>
  )
}