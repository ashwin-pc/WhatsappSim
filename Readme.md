# Whatsapp Simulator

> A parsing and simulation engine for whatsapp chats, completely clientside (nothing is sent to a server).

Whatsapp for the longest time allows you to copy paste chat in a purely textual form. We can save these chats for reference in the future, but we could never load that chat back to re visualize the conversation again. This simulation engine is built to be able to parse the plain textual form of a whatsapp chat automatically into discernable chat objects using vanilla javascript and the using its simulation engine and style sheets, resimulate the chat experience.

The engine can be used partially or completely and has no external dependency (Except typicons for the demo page).

[Demo Site](https://designedbyashw.in/test/wsim/)

## Table of Contents

- [Background](#background)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Background

The parsing and simulation library are a part of the `dependencies > WhatsappSim` folder

## Usage

This is a completely front end library. Simply include the WhatsappSim.js and/or the WhatsappSim.css and images (to simulate the look and feel of Whatsapp) in your project and you are good to go.

## API

### Parser

1. WhatsappSim.parse(txt, [options])
    Parse the whatsapp text and return an conversation object

    - txt: The formatted string exported or copied from whatsapp.
    - options: Simulation Options (Optional) (replayType, replayInterval, me.name, me.number)

1. WhatsappSim.addFormat(format)

    Add a new unsupported format of parsing the chat. This requires 3 parameters in the format object.

    - format.name: A name to identify the format by
    - format.testRegex: The regex to test the conversation line by line to identify the start of every message line
    - format.splitRegx: The regex used to identify the two points to split the string to get the date, author and message portions of the string
    - format.hasBrackets: **Optional**, Boolean, Default false

    e.g.

    ````js
    {
        name: "allBrackets",
        testRegex: /^\[\d{1,2}(:|\/).+\]/,
        splitRegx: /(\]\s|\:\s)/,
        hasBracket: true
    }
    ````

### Simulation

1. WhatsappSim.config([options])

    Set the Simulation options.

    - options: Simulation Options (Optional) (replayType, replayInterval, me.name, me.number)

1. WhatsappSim.createMsgElement(message)

    Creates a DOM Element with the structure of a whatsapp message object. The Stylesheet WhatsappSim.css can be modified to change the appearance of the message as this functions just returns a standard structure of the message element.

    - message.system: [Boolean] True is message is a system message
    - message.txt: [String] Message text
    - message.timestamp: [String] (Optional for system messages)
    - message.self: [Boolean] (Optional) True if the message is by the author or False if someone else (**Default: False**)
    - message.continuation: [Boolean] (Optional) True if the message is a continuation of the previous messgage (**Default: False**)
    - message.tail: [Boolean] (Optional) True if the message has a tail at the end of it (**Default: False**)
    - message.authorId: [Integer] (Optional) ID of the author in the conversation list
    - message.name: [String] (Optional if authorId not provided) Name of the messages author

    `WhatsappSim.parse()` will return a conversation array whose objects will conform to this structure. Refer to the parse function for more clarity.

1. WhatsappSim.setPrimaryAuthor(author)

    Sets the primary author of the conversation.

    - author: [String or Integer] The author can be the name or ID of the author as per the conversation list

1. WhatsappSim.startSimulation()

    Start the simulation engine scheduler. Message objects from the message queue are used based on the simulation configurations.

1. WhatsappSim.pauseSimulation()

    Pause the simulation engine scheduler

1. WhatsappSim.stopSimulation()

    Stop the simulation engine scheduler and clear the message queue.

1. WhatsappSim.resetSimulation()

    Reset the simulation engine scheduler and reload the initial message stack back into the queue

## Contribute

PRs accepted.

## License

[MIT © Ashwin P Chandran.](./LICENSE)