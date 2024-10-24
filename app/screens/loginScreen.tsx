import Image from 'next/image'
import PersonPicker from '../ui-components/personPicker'
import { userData } from '../data/user-data'

export default function LoginScreen ({
  personSelected = (person) => {},
  disabledId = -1,
  isLeft = true
}) {
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
    <div className='text-xl text-center m-2'>{isLeft ? 'Select First User' : 'Select Second User'}</div>
    <div className='w-full grid grid-cols-2  gap-2 p-2 overflow-y-auto overscroll-none touch-pan-y'>
      {userData?.users.map((user, index) => {
        return (
          <PersonPicker
            key={index}
            id={index}
            name={user.name}
            phone={user.phone}
            avatarUrl={user.avatarUrl}
            personSelected={() => {personSelected(index)}}
            disabled={index == disabledId}
          ></PersonPicker>
        )
      })}
    </div>
  </div>

  )
}
