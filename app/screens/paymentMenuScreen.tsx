import Image from 'next/image'
import Avatar from '../ui-components/avatar'
import Pill from '../ui-components/pill'
import PersonPicker from '../ui-components/personPicker'
import { CurrencySymbol } from '@/app/types'
import { userData } from '../data/user-data'
import { useState } from 'react'

export default function PaymentMenuScreen ({ loggedInUser, otherUser, logoutUser, balance, setBalance, sendMoneyClick, requestMoneyClick, chatWithFriendClicked }) {

  function logout () {
    logoutUser()
  }

  function topUpBalance () {
    if (balance < 100000) setBalance(balance + 1000)
  }

  function personSelected () {
    chatWithFriendClicked(otherUser)
  }

  function chatWithSupport() {
    console.log('Chat with Support')
  }

  return (
    <div className='w-full mt-8 flex flex-col items-center overflow-y-auto overscroll-none'>
      <Image
        src='/icons/logout.svg'
        alt='Left Arrow'
        className='absolute top-10 left-2 cursor-pointer'
        onClick={() => {
          logout()
        }}
        width={30}
        height={30}
      />
      <div className='text-2xl text-center m-1'>Payment Home</div>
      <Avatar
        avatarUrl={userData.users[loggedInUser]?.avatarUrl}
        width={48}
        height={48}
      ></Avatar>
      <div className='flex flex-row items-center'>
        <div className='text-sm m-1'>You: {userData.users[loggedInUser]?.name}</div>
        <div className='m-1 text-xs text-neutral-500'>
          {' '}
          ({userData.users[loggedInUser]?.phone})
        </div>
      </div>

      {/* Balance */}
      <div className='flex flex-row bg-neutral-200 py-4 px-8 gap-2 rounded-2xl justify-center shadow-lg mt-2'>
        <div className=''>Balance: </div>
        <div className='font-semibold'>
          {CurrencySymbol}
          {(balance / 100).toFixed(2)}
        </div>
        <Pill
          text='Top Up'
          className={'ml-4'}
          clickAction={topUpBalance}
          textClassName={'text-xs'}
        ></Pill>
      </div>

      {/* Transfer Money */}
      <div className='w-full flex flex-col items-center mt-4'>
        <div className='text-lg'>Transfer Money</div>
        <div className='w-full flex flex-row justify-center'>
          <div className='flex flex-col items-center px-4 justify-center'>
            {/* Send Money */}
            <div
              className='flex flex-row justify-center cursor-pointer'
              onClick={() => {
                sendMoneyClick()
              }}
            >
              <Image
                src='/brand-icons/Fintech5_Icon.svg'
                alt='FinTech Icon'
                className='mb-2'
                width={50}
                height={50}
              />
              <Image
                src='/icons/arrow-right.svg'
                alt='Right Arrow'
                className='mb-2'
                width={25}
                height={25}
              />
            </div>
            <Pill
              text='Send Money'
              clickAction={() => {
                sendMoneyClick()
              }}
              className={'py-2'}
              textClassName={'text-sm'}
            ></Pill>
          </div>

          <div className='flex flex-col items-center px-4'>
            {/* Request Money */}
            <div
              className='flex flex-row justify-center cursor-pointer'
              onClick={() => {
                requestMoneyClick()
              }}
            >
              <Image
                src='/icons/arrow-left.svg'
                alt='Left Arrow'
                className='mb-2'
                width={25}
                height={25}
              />
              <Image
                src='/brand-icons/Fintech4_Icon.svg'
                alt='FinTech Icon'
                className='mb-2'
                width={50}
                height={50}
              />
            </div>
            <Pill
              text='Request Money'
              clickAction={() => {
                requestMoneyClick()
              }}
              className={'py-2'}
              textClassName={'text-sm'}
            ></Pill>
          </div>
        </div>
        {/* Chat with Friends */}
        <div className='flex flex-col w-full items-center mt-4 gap-1'>
          <div className='text-lg'>Chat with Friends</div>
          <div className='text-xs self-start mx-2'>Available Friends:</div>
          {otherUser != -1 ? (
            <PersonPicker
              id={userData.users[otherUser].name}
              name={userData.users[otherUser].name}
              phone={userData.users[otherUser].phone}
              avatarUrl={userData.users[otherUser].avatarUrl}
              personSelected={personSelected}
              className={'w-3/5'}
            ></PersonPicker>
          ) : (
            <div className='text-sm self-start mx-2'>
              You have no available friends 😔
            </div>
          )}
          <div className='text-xs self-start mx-2'>
            Friends who are unavailable:
          </div>
          <div className='text-sm self-start mx-2'>
            You have no unavailable friends 😔
          </div>
        </div>
        {/* Administration */}
        <hr className="w-4/5 bg-gray-300 my-4"></hr>
        <div className='flex flex-col items-center'>
          <div className='flex flex-row items-center gap-2 cursor-pointer bg-white p-1 rounded-2xl shadow-lg ' onClick={() => {chatWithSupport()}}>
            <Image
              src='/brand-icons/Support_Icon.svg'
              alt='FinTech Icon'
              className='mb-2'
              width={50}
              height={50}
            />

            <div className='text-md'>Chat with Support</div>
          </div>
        </div>
      </div>
    </div>
  )
}
