import Image from 'next/image'
import PersonPicker from '../ui-components/personPicker'
import { Chat, User } from '@pubnub/chat'
import { useState, useEffect } from 'react'

export default function LoginScreen ({
  personSelected = person => {},
  disabledId,
  isLeft = true,
  chat
}) {
  const [allUsers, setAllUsers] = useState<User[]>()

  useEffect(() => {
    if (!chat) return
    chat
      .getUsers({}) //  Could also filter by Profile URL:  || profileUrl LIKE "*${term}*"
      .then(userResults => {
        setAllUsers(userResults.users)
      })
  }, [chat])

  return (
    <div className='w-full mt-8 flex flex-col items-center'>
      <div className='text-3xl text-center m-3'>PubNub FinTech Demo</div>
      <Image
        src='/brand-icons/FinTech4_Icon.svg'
        alt='FinTech Icon'
        className='mb-2'
        width={50}
        height={50}
      />
      <div className='text-xl text-center m-2'>
        {isLeft ? 'Select First User' : 'Select Second User'}
      </div>
      <div className='w-full grid grid-cols-2  gap-2 p-2 overflow-y-auto overscroll-none touch-pan-y'>
        {allUsers?.map((user, index) => {
          return (
            user.id !== 'bootstrap' &&
            user.id !== 'PUBNUB_INTERNAL_MODERATOR' && (
              <PersonPicker
                key={index}
                id={user.id}
                name={user.name}
                phone={user.custom?.phone}
                avatarUrl={user.profileUrl}
                personSelected={() => {
                  personSelected(user.id)
                }}
                disabled={user.id == disabledId}
              ></PersonPicker>
            )
          )
        })}
      </div>
    </div>
  )
}
