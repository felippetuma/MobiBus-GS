import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const NotFound = () => {
  return (
    <>
    <Navbar/>
    <div className='relative flex flex-col gap-2 justify-center items-center w-full h-dvh select-none outline-none'>
      <Image src="/icons/404-mobibus.svg" alt='Icone 404 Pagina not found' width={800} height={600} className='w-full max-w-200 h-auto px-6'/>
      <h1 className="font-bold text-3xl">Essa rota não existe</h1>
      <p className='text-sm sm:text-base md:text-lg font-medium text-center max-w-xs sm:max-w-md md:max-w-xl px-6 text-balance'>O endereço pode ter mudado ou nunca ter existido.</p>
      <Link href="/" className='px-4 py-4 bg-blue-mobi rounded-full text-md shadow-lg hover:shadow-blue-mobi transition-colors duration-300 hover:-translate-y-1'>Voltar para página inicial</Link>
    </div>
    </>
  )
}

export default NotFound
