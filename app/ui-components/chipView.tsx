//  Shown above the message input field on the chat view

import Pill from '../ui-components/pill'

export default function ChipView ({
  sendMoneyClick,
  requestMoneyClick,
  typingData,
  remoteUser
}) {
  return (
    <div className='flex flex-col w-full'>
      <div className='flex flex-row w-full justify-start pl-5 p-2 gap-5 border-t-[1px]'>
        <Pill
          text='Send Money'
          className={'bg-navy600 p-1'}
          clickAction={sendMoneyClick}
          textClassName={'text-xs'}
        ></Pill>
        <Pill
          text='Request Money'
          className={'bg-navy600 p-1'}
          clickAction={requestMoneyClick}
          textClassName={'text-xs'}
        ></Pill>
      </div>
      {typingData.length > 0 && (
        <div className='flex text-xs self-end mr-3'>
          {remoteUser?.name} is typing
        </div>
      )}
    </div>
  )
}
