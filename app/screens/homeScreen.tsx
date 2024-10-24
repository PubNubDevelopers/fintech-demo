import Image from 'next/image'
import PaymentMenuScreen from './paymentMenuScreen'
import TransferMoneyScreen from './transferMoneyScreen'
import ChatScreen from './chatScreen'
import ReceiptScreen from './receiptScreen'
import { TransferType } from '@/app/types'
import { useState } from 'react'

export default function HomeScreen ({ loggedInUser, otherUser, logoutUser }) {
  //  0 is top level payment menu
  //  1 is payment transfer screen
  //  2 is the chat screen
  //  3 is the receipt screen
  const [screen, setScreen] = useState(0)
  //  todo default balance should come from app context
  const [balance, setBalance] = useState(10000) //  In whatever fractional units are used
  const [transferType, setTransferType] = useState(TransferType.SEND)

  function sendMoneyClick () {
    setTransferType(TransferType.SEND)
    setScreen(1)
  }

  function requestMoneyClick () {
    setTransferType(TransferType.REQUEST)
    setScreen(1)
  }

  function chatWithFriendClicked (friend) {
    console.log('chatting with ' + friend)
    setScreen(2)
  }

  function initiateTransferRequest (transferType, transferAmount, recipient) {
    console.log(
      'Initiating a ' +
        transferType +
        ' transfer request for ' +
        transferAmount +
        ' to ' +
        recipient
    )
    //  ToDo Send message that represents payment request
    if (otherUser != -1) {
      setScreen(2)
    }
  }

  if (screen == 0)
    return (
      <PaymentMenuScreen
        loggedInUser={loggedInUser}
        otherUser={otherUser}
        logoutUser={logoutUser}
        balance={balance}
        setBalance={setBalance}
        sendMoneyClick={sendMoneyClick}
        requestMoneyClick={requestMoneyClick}
        chatWithFriendClicked={chatWithFriendClicked}
      ></PaymentMenuScreen>
    )
  if (screen == 1)
    return (
      <TransferMoneyScreen
        otherUser={otherUser}
        transferType={transferType}
        currentBalance={balance}
        goBack={() => {
          setScreen(0)
        }}
        initiateTransferRequest={initiateTransferRequest}
      ></TransferMoneyScreen>
    )
  if (screen == 2)
    return (
      <ChatScreen
        goBack={() => {
          setScreen(0)
        }}
        loggedInUser={loggedInUser}
        otherUser={otherUser}
      ></ChatScreen>
    )
  if (screen == 3)
    return (
      <ReceiptScreen
        goBack={() => {
          setScreen(2)
        }}
        transactionId={'5641232135101'}
        sender={loggedInUser}
        recipient={otherUser}
        amount={10000}
        reference={'546510133'}
        timeOfRequest={'Oct 24, 2024 15:54:33'}
        timeOfTransactionComplete={'Oct 24, 2024 15:53:11'}
      ></ReceiptScreen>
    )
}
