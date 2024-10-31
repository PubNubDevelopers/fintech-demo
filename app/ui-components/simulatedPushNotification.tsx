import Image from 'next/image'

export default function SimulatedPushNotification ({
  message = 'Message',
  isVisible,
  setIsVisible,
  isClicked
}) {
  return (
    isVisible && (
      <div className='absolute left-0 top-8 rounded-xl p-2 z-40 w-full bg-white border-black border-2 h-36 cursor-pointer'>
        <div
          className='absolute right-2 cursor-pointer z-50'
          onClick={() => {
            setIsVisible(false)
          }}
        >
          <Image
            src='/icons/x-mark.svg'
            alt='Icon'
            className={``}
            width='25'
            height='25'
          />
        </div>

        <div
          className='w-full flex flex-row gap-2'
          onClick={() => {
            isClicked()
          }}
        >
          <Image
            src='/brand-icons/Fintech_Icon.svg'
            alt='Icon'
            className={`self-start rounded-full}`}
            width='50'
            height='50'
          />
          <div className='flex flex-col gap-2'>
            <div className=''>Simulated Push Notification</div>
            <div className='text-xs'>
              PubNub supports native push notifications for Android (GCM) and
              iOS (APNS)
            </div>
            <div className=''>{message}</div>
          </div>
        </div>
      </div>
    )
  )
}
