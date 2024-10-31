import Avatar from './avatar'
import { PresenceIcon } from '@/app/types'

export default function PersonPicker ({
  id,
  name,
  phone,
  avatarUrl,
  disabled = false,
  className = '',
  personSelected,
  showPresence = PresenceIcon.NOT_SHOWN
}) {
  return (
    <div
      className={`${
        disabled ? 'bg-neutral-300' : 'bg-white cursor-pointer'
      } ${className} m-1 p-1 border-2 border-navy500 rounded-xl flex flex-row items-center gap-1`}
      onClick={() => {
        if (!disabled) personSelected(id)
      }}
    >
      {/* 
      Note: This demo will always hardcode the presence as online.  PubNub offers two ways to track whether a user is online or offline using our Chat SDK, either at the global level, or per-channel.  See https://www.pubnub.com/docs/chat/chat-sdk/build/features/users/presence for more information.
      */}
      <Avatar
        avatarUrl={avatarUrl}
        present={showPresence}
        width={48}
        height={48}
      ></Avatar>
      <div className='flex flex-col'>
        <div className='w-full text-xs'>{name}</div>
        <div className='w-full text-xs text-neutral-500'>{phone}</div>
      </div>
    </div>
  )
}
