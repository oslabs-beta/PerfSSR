import './globals.css';
import Header from './components/Header';
import { Poppins } from 'next/font/google';
import { install } from 'fetch-timer'
import PerfSSR from './components/PerfSSR';

install();
console.log("in layout", globalThis.fetch);


const poppins = Poppins({ 
  weight: ['400', '700'],
  subsets: ['latin'],
 })

export const metadata = {
  title: 'New Next App Demo',
  description: 'Generated for testing purposes',
}

console.log("globalthis outside layout", globalThis.perfSSRData.data);

export default function RootLayout({ children }) {
  console.log("globalthis layout", globalThis.perfSSRData.data);
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Header />
        <PerfSSR data={globalThis.perfSSRData}/>
        <main className='container'>{children}</main>
      </body>
    </html>
  )
}
