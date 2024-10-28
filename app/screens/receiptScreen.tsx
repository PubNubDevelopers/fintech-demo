import Image from 'next/image'
import Avatar from '../ui-components/avatar'
import Pill from '../ui-components/pill'
import PersonPicker from '../ui-components/personPicker'
import { CurrencySymbol, TransferType } from '@/app/types'
import { useState } from 'react'

export default function ReceiptScreen ({
  goBack,
  transactionId,
  sender,
  recipient,
  amount,
  reference,
  timeOfRequest,
  timeOfTransactionComplete
}) {
  return (
    <div className='w-full mt-8 flex flex-col items-center overflow-y-auto overscroll-none'>
      <Image
        src='/icons/menu-back.svg'
        alt='Left Arrow'
        className='absolute top-10 left-2 cursor-pointer'
        onClick={() => {
          goBack()
        }}
        width={30}
        height={30}
      />
      <div className='flex flex-col w-full h-full items-center bg-navy300'>
        <div className='text-2xl text-center m-1'>{`Receipt`}</div>

        <div className='flex p-2 z-20 rounded-full border-navy700 border-2 bg-white'>
          <Image
            src='/icons/receipt.svg'
            alt='Receipt'
            className=''
            width={20}
            height={20}
          />
        </div>

        <div className='flex flex-col relative -top-5 w-[90%] bg-neutral50 rounded-md px-4 py-7 gap-1'>
          <div className='flex flex-col'>
            <div className='text-xs'>Transaction id</div>
            <div className='text-lg'>0231 2165 2a156</div>
          </div>
          <div className='flex flex-col'>
            <div className='text-xs'>Sent by</div>
            <div className='flex flex-row items-center'>
              <div className='text-lg'>{sender?.name}</div>
              <div className='text-sm text-neutral-500 ml-1'>
                {`(${sender?.custom?.phone})`}
              </div>
            </div>
          </div>
          <div className='flex flex-col'>
            <div className='text-xs'>Recipient</div>
            <div className='flex flex-row items-center'>
              <div className='text-lg'>{recipient?.name}</div>
              <div className='text-sm text-neutral-500 ml-1'>
                {`(${recipient?.custom?.phone})`}
              </div>
            </div>
          </div>
          <div className='flex flex-col'>
            <div className='text-xs'>Sent by</div>
            <div className='text-lg'>Immediate Payment</div>
          </div>
          <hr className='w-4/5 bg-gray-300 my-4'></hr>
          <div className='flex flex-row justify-between'>
            <div className='text-lg'>Amount: </div>
            <div className='flex flex-row'>
              <div className='text-lg font-semibold'>{CurrencySymbol}</div>
              <div className='text-lg font-semibold'>
                {(amount / 100).toFixed(2)}
              </div>
            </div>
          </div>
          <hr className='w-4/5 bg-gray-300 my-4'></hr>
          <div className='flex flex-row justify-between'>
            <div className='text-xs'>Reference:</div>
            <div className='text-xs'>{reference}</div>
          </div>
          <div className='flex flex-row justify-between'>
            <div className='text-xs'>Request:</div>
            <div className='text-xs'>{timeOfRequest}</div>
          </div>
          <div className='flex flex-row justify-between'>
            <div className='text-xs'>Complete:</div>
            <div className='text-xs'>{timeOfTransactionComplete}</div>
          </div>
        </div>
        <div className='flex flex-row relative -top-5 '>
          {[...new Array(7)].map((user, index) => {
            return (
              <div
                key={index}
                className='w-0 h-0 
                border-l-[20px] border-l-transparent
                border-t-[25px] border-t-neutral50
                border-r-[20px] border-r-transparent'
              ></div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
