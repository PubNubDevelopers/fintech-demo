import Image from 'next/image'
import Avatar from '../ui-components/avatar'
import Pill from '../ui-components/pill'
import PersonPicker from '../ui-components/personPicker'
import { CurrencySymbol, TransferType } from '@/app/types'
import { userData } from '../data/user-data'
import { useState } from 'react'

export default function TransferMoneyScreen ({
  otherUser = -1,
  prepopulatedUser = -1,
  transferType,
  currentBalance,
  goBack,
  initiateTransferRequest
}) {
  const [transferAmount, setTransferAmount] = useState(500)
  const [projectedBalance, setProjectedBalance] = useState(
    transferType == TransferType.SEND
      ? currentBalance - transferAmount
      : currentBalance + transferAmount
  )
  const [selectedRecipient, setSelectedRecipient] = useState(prepopulatedUser)

  function increaseTransferAmount (amount) {
    if (transferType == TransferType.SEND) {
      if (projectedBalance - amount >= 0) {
        setTransferAmount(transferAmount + amount)
        setProjectedBalance(projectedBalance - amount)
      }
    } else {
      if (transferAmount + amount <= 10000) {
        setTransferAmount(transferAmount + amount)
        setProjectedBalance(projectedBalance + amount)
      }
    }
  }

  function decreaseTransferAmount (amount) {
    if (transferAmount - amount >= 0) {
      setTransferAmount(transferAmount - amount)
      if (transferType == TransferType.SEND) {
        setProjectedBalance(projectedBalance + amount)
      } else {
        setProjectedBalance(projectedBalance - amount)
      }
    }
  }

  function recipientClicked () {
    if (otherUser != -1) {
      console.log('recipient clicked')
      if (selectedRecipient == -1) setSelectedRecipient(otherUser)
      else setSelectedRecipient(-1)
    }
  }

  function requestMoney () {
    initiateTransferRequest(transferType, transferAmount, selectedRecipient)
  }

  function back () {
    goBack()
  }

  return (
    <div className='w-full mt-8 flex flex-col items-center overflow-y-auto overscroll-none'>
      <Image
        src='/icons/menu-back.svg'
        alt='Left Arrow'
        className='absolute top-10 left-2 cursor-pointer'
        onClick={() => {
          back()
        }}
        width={30}
        height={30}
      />

      <div className='text-2xl text-center m-1'>{`${
        transferType == TransferType.SEND ? 'Send' : 'Request'
      } Money`}</div>

      <div className='w-full flex flex-row justify-center'>
        {transferType == TransferType.SEND && (
          <div className='flex flex-col items-center px-4 justify-center'>
            {/* Send Money */}
            <div className='flex flex-row justify-center'>
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
          </div>
        )}

        {transferType == TransferType.REQUEST && (
          <div className='flex flex-col items-center px-4'>
            {/* Request Money */}
            <div className='flex flex-row justify-center'>
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
          </div>
        )}
      </div>

      {/* Balance */}
      <div className='flex flex-col bg-neutral-200 py-2 px-12 gap-2 rounded-2xl justify-center shadow-lg mt-2 w-5/6'>
        <div className=''>
          Amount to {transferType == TransferType.SEND ? 'Send' : 'Request'}:{' '}
        </div>
        <div className='flex flex-row'>
          <div
            className={
              transferAmount == 0
                ? `font-semibold text-cherry`
                : `font-semibold`
            }
          >
            {CurrencySymbol}
            {(transferAmount / 100).toFixed(2)}
          </div>
          <Pill
            text='—'
            className={'ml-4'}
            clickAction={() => {
              decreaseTransferAmount(500)
            }}
            textClassName={'text-xs'}
          ></Pill>
          <Pill
            text='+'
            className={'ml-2'}
            clickAction={() => {
              increaseTransferAmount(500)
            }}
            textClassName={'text-xs'}
          ></Pill>
        </div>

        <div className=''>Projected Balance: </div>
        <div
          className={
            projectedBalance < 0 ? `font-semibold text-cherry` : `font-semibold`
          }
        >
          {CurrencySymbol}
          {(projectedBalance / 100).toFixed(2)}
        </div>
      </div>

      {/* Transfer Money */}
      <div className='w-full flex flex-col items-center mt-4'>
        {/* Chat with Friends */}
        <div className='flex flex-col w-full items-center mt-4 gap-1'>
          <div className='text-lg p-2 text-center'>
            {transferType == TransferType.SEND ? 'Money' : 'Request'} will be
            sent to
            {otherUser != -1 && selectedRecipient != -1 ? (
              <div className='font-semibold'>
                {userData.users[selectedRecipient].name}
              </div>
            ) : (
              <div className='font-semibold'>Please Select Recipient</div>
            )}
          </div>
          <div className='text-xs self-start mx-2'>Possible Recipients</div>
          {otherUser != -1 ? (
            <PersonPicker
              id={userData.users[otherUser].name}
              name={userData.users[otherUser].name}
              phone={userData.users[otherUser].phone}
              avatarUrl={userData.users[otherUser].avatarUrl}
              personSelected={recipientClicked}
              className={
                selectedRecipient == -1
                  ? 'w-3/5 opacity-100'
                  : 'w-3/5 opacity-30'
              }
            ></PersonPicker>
          ) : (
            <div className='text-sm self-start mx-2'>
              Cannot find any users 😔. Try logging on as another user.
            </div>
          )}
        </div>

        {otherUser != -1 && selectedRecipient != -1 && transferAmount > 0 && projectedBalance > 0 && (
          <button
            type='button'
            onClick={() => {
              requestMoney()
            }}
            className='relative bg-navy900 text-neutral50 text-sm py-3 m-3 rounded-md shadow-sm w-5/6'
          >
            {transferType == TransferType.SEND ? 'Send' : 'Request'} Money
          </button>
        )}
      </div>
    </div>
  )
}
