import './globals.css';
import Header from './components/Header';
import { Poppins } from 'next/font/google';

const poppins = Poppins({ 
  weight: ['400', '700'],
  subsets: ['latin'],
 })

export const metadata = {
  title: 'New Next App Demo',
  description: 'Generated for testing purposes',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Header />
        <main className='container'>{children}</main>
      </body>
    </html>
  )
}
