# PubNub FinTech Demo

Application to show how PubNub can add real-time features to your FinTech solution and improve the user experience

## Demo

A hosted version of this demo can be found at [https://pubnub-fintech-demo.netlify.app](https://pubnub-fintech-demo.netlify.app)

## Installation / Getting Started

This application is written with NextJS, so be sure to have a copy of [Node.js 18.17](https://nodejs.org/) or later installed.

To run this project yourself you will need a PubNub account

<a href="https://admin.pubnub.com/signup">
	<img alt="PubNub Signup" src="https://i.imgur.com/og5DDjf.png" width=260 height=97/>
</a>

### Get Your PubNub Keys

1. You’ll first need to sign up for a [PubNub account](https://admin.pubnub.com/signup/). Once you sign up, you can get your unique PubNub keys from the [PubNub Developer Portal](https://admin.pubnub.com/).

1. Sign in to your [PubNub Dashboard](https://admin.pubnub.com/).

1. Click Apps, then **Create New App**.

1. Give your app a name, and click **Create**.

1. Click your new app to open its settings, then click its keyset.

1. Enable the Stream Controller feature on your keyset (this should be enabled by default after you created the keyset)

1. Enable the Presence feature.

1. Enable the Message Persistence feature on your keyset and choose a duration

1. Enable the App Context feature.

1. Enable the File Sharing feature.

1. Copy the Publish and Subscribe keys and paste them into your app as specified in the next step.

## Building and Running

1. Clone the repository

1. Replace the `.env.sample` file with a `.env` file and populate it with the publish and subscribe keys you generated in the previous step.

1. `yarn install`

1. `yarn dev`

1. You can now navigate to `localhost:3000` in your browser