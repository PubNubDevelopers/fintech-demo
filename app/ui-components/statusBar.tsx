'use client'

import Image from 'next/image'

export default function CustomStatusBar ({
    notch = false
}) {
  return (
    <div className="absolute flex flex-row items-center bg-navy800 w-full rounded-t-l h-8 z-0">
    <div suppressHydrationWarning className={`${notch ? 'ml-2' : 'ml-10'} m-1 text-xs text-neutral50`}>
      {new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
    </div>
    <div className="grow"></div>
    <div className="flex flex-row-reverse gap-1 m-1">
      <Image
          src='/icons/battery.svg'
          alt='Battery Icon'
          className='self-center fill-white'
          width={20}
          height={20}
          priority
        />
        <Image
          src='/icons/wifi.svg'
          alt='WiFi Icon'
          className='self-center'
          width={20}
          height={20}
          priority
        />
    </div>
  </div>
  )
}
