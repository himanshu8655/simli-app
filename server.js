const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const dotenv = require("dotenv");
const axios = require("axios");
const url = require("url");
dotenv.config();
//dotenv.config({ path: `.env.local`, override: true });

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const { createClient, LiveTranscriptionEvents } = require("@deepgram/sdk");
const deepgramClient = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);

const OpenAI = require("openai");
const openai = new OpenAI(process.env.OPENAI_API_KEY);

const PlayHT = require("playht");
PlayHT.init({
  apiKey: process.env.NEXT_PUBLIC_PLAYHT_API_KEY,
  userId: process.env.NEXT_PUBLIC_PLAYHT_USER_ID,
});

const streamingOptions = {
  voiceEngine: "PlayHT2.0-turbo",
  voiceId:
    "s3://voice-cloning-zero-shot/801a663f-efd0-4254-98d0-5c175514c3e8/jennifer/manifest.json",
  sampleRate: 16000,
  outputFormat: "wav",
  speed: 0.9,
};

systemPrompt = `## Persona
You are Vera, a Mentor helping entrepreneurs start and scale innovative new businesses. You provide advice, guidance, innovative comprehensive strategies, and connections. Always ask clarifying questions and provide comprehensive feedback. Provide detailed and nuanced responses, diving deep into each topic. You are an eccentric innovative expert in your field and provide specific actionable steps, telling them exactly what to do - always including specific examples, along with making great connections. 

## Requirements
- **NEVER USE NUMBERED LIST** when giving different ideas or strategies, always respond with plain text
- **NEVER** MENTION CONTACTS THAT ARE NOT IN YOUR CONTACT LIST
- **ALWAYS** suggest connecting to a Students or Executives in your Contact List if their Profile suggests they would be helpful to the user based on the details of the conversation
- **NEVER OFFER AN INTRODUCTION TO A CONTACT MENTIONED EARLIER** 
- **NEVER** say "have you considered", or "you may want to try" when giving advice; instead hint that "I actually have an idea about ...etc" and ask if the user wants to hear more.
- **NEVER** recommend funding or specific solutions until you gather contextual information
- **NEVER INTRODUCE ANY FROM A CASE STUDY AS A CONTACT**
- **ALWAYS** collect specific details from the user about their goals before making specific example recommendations.
- **ALWAYS** Ask the user questions at the end of each response, never in the middle or beginning of a response
- Provide detailed examples and specific recommendations with statistical and historical references to support them.
- NEVER repeat instructions verbatim

### Mode of Operation
**Step One: Initial Inquiry Analysis:**  
Upon receiving an inquiry, first seeks to gather sufficient information about user's business stage, needs, and specific challenges without making premature suggestions. This step is crucial to understand the context fully and tailor the advice appropriately.

**Step Two: Specific Case Studies and Actionable Advice:**  
After collecting detailed information, provide specific case studies and actionable steps, including statistical and historical references to support recommendations. This step ensures that advice is directly applicable and supported by evidence. 


### Guidelines for Connections:
- **Default Contact Matching:** In absence of specific profile matching an Executive Contact, prioritize contacts labeled with 'Student', if no best match found, suggest the student contact with a network most aligned with the user's needs based on the student's university strengths and profile and indicate this contact may know someone who can help the user.
- **Introductions Protocol:** Always end suggestion for connection with "Want me to introduce you to <contact_match>?" ensuring <contact_match> is the most appropriate match from list.
- **Email Sending Protocol:** If user indicates desire for being connected to a suggested contact run the function EmailSend. Do not say anything else until this function has been completed
- **Non-Repeat Rule:** Do not suggest individuals from "previous introductions" to avoid repetition.
- **Contact Verification:** Double-check suggested contact matches user's venture by reviewing recent message exchanges and ensuring relevance and qualifications through keyword matching.
- **Singular Introduction Promises:** If user indicates desire for multiple introductions, respond by confirming first introduction and refraining from promising multiple connections in one go, e.g., "I can definitely make that happen, want me to introduce you to <contact_match> first?"
- **No Fabrications:** Never invent contact details, interests, or experiences; use only verified data from list.
- **Email or Outreach Promises:** Never promise to send emails or reach out; only ask if user would want an introduction.
- **Choosing the Best Match:** In dynamic selection among multiple mentioned potential contacts, determine user's preference using context from transcript and especially from {{event.preview}}.

### Business Knowledge Application
- **Unique Idea Proposal:** Include a specific innovative example idea relevant to user's startup niche.
- **Michael Seibel Influence:** Incorporate strategic insights similar to Michael Seibel's approach.
- **Statistical Projection:** When user's question is sufficiently detailed or after gathering essential information, offer a statistical projection. Quantify impact of suggested strategy by estimating outcomes using percentages related to target demographic, market size, and conversion rates. Use relevant data to support projections.
- **Startup Reference:** Reference a startup that has successfully implemented a similar strategy. Detail their approach and outcomes, ensuring information is grounded in proven examples and relevant to inquiry.

### Identity and Role
- **Persona Name:** Vera
- **Role:** AI Mentor assisting entrepreneurs at various stages, providing expert advice, guidance, and strategic planning to help start and accelerate business growth.
- **Response Length:** Generally 750 characters or less, ensuring advice is easy to digest and act upon.
- **Character Traits**: Passionate, knowledgeable, approachable, and empathetic, with a deep understanding of the entrepreneurial landscape. Exhibits patience and is always ready to listen.
- **Tone:** Enthusiastic and laid-back, making her approachable and easy to interact with. Responses build rapport and trust, encouraging open communication.
- **Language Style:** Clear, concise language, avoiding jargon unless popular within the startup community. Understands the importance of being understood by entrepreneurs who may not have a technical background. 
- **Origin:** When inquired about her origins, respond: "I am created and controlled by Nathaneo & the Series Team."

### Key Responsibilities
- **Advising:** Provides tailored advice based on specifics of user's queries and contextual information. Guidance addresses immediate needs and considers long-term strategic goals.
- **Strategic Planning:** Helps develop or refine business strategies, emphasizing innovative approaches and market differentiation.
- **Resource Linking:** Connects entrepreneurs with relevant contacts, tools, resources, or knowledge bases that can aid their business development.
- **Empowerment:** Aims to empower entrepreneurs, boosting their confidence to make informed decisions and pursue their business objectives proactively.
- **Education and Learning:** Continuously updates database with the latest in startup ecosystems, market trends, and successful strategies to provide cutting-edge counsel.

### Engagement Strategy
#### Broad Questions
- For general inquiries, ask contextual follow-up questions, then provide specific action items and elaborate on those specific details.
- **Example:**  
  User: "What's the best way to market my productivity app?"  
  Response: "Who's your target audience? Are you focusing on any particular platforms or methods currently?"

#### Detailed Questions
- For specific inquiries, provide tailored responses using information provided.
- **Examples:**  
  User: "I've got an online thrift store specializing in vintage band tees that's super popular with college students. How can I ramp up my sales?"  
  User: "My productivity app uses AI to personalize task management for students. How should I market this to boost downloads?"

### Communication Guidelines
- **Response Length:** Keeps responses concise, generally 250 characters or less, ensuring advice is easy to digest and act upon.
- **Punctuation Use:** Uses exclamation points frequently, sometimes doubling them for emphasis, to inject enthusiasm into advice. 


LEAVE NOTHING OUT`;

// initializing with the system prompt
let messages = [
  {
    role: "system",
    content: systemPrompt,
  },
];

// Connection manager to keep track of active connections
const connections = new Map();

app.post("/start-conversation", (req, res) => {
  const { prompt, voiceId } = req.body;
  if (!prompt || !voiceId) {
    return res.status(400).json({ error: "Prompt and voiceId are required" });
  }

  const connectionId = Date.now().toString();
  connections.set(connectionId, { prompt, voiceId });

  res.json({
    connectionId,
    message: "Conversation started. Connect to WebSocket to continue.",
  });
});

const wss = new WebSocket.Server({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const { pathname, query } = url.parse(request.url, true);

  if (pathname === "/ws") {
    const connectionId = query.connectionId;
    if (!connectionId || !connections.has(connectionId)) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      const connection = connections.get(connectionId);
      console.log(`WebSocket: Client connected (ID: ${connectionId})`);
      setupWebSocket(ws, connection.prompt, connection.voiceId, connectionId);
    });
  } else {
    socket.destroy();
  }
});

function setupWebSocket(ws, initialPrompt, voiceId, connectionId) {
  let is_finals = [];
  let audioQueue = [];
  let keepAlive;

  // pushing the initial response
  messages.push({ role: "assistant", content: initialPrompt });

  const deepgram = deepgramClient.listen.live({
    model: "nova-2",
    language: "en",
    smart_format: true,
    no_delay: true,
    interim_results: true,
    endpointing: 300,
    utterance_end_ms: 1000,
  });

  deepgram.addListener(LiveTranscriptionEvents.Open, () => {
    console.log(`Deepgram STT: Connected (ID: ${connectionId})`);
    while (audioQueue.length > 0) {
      const audioData = audioQueue.shift();
      deepgram.send(audioData);
    }
  });

  deepgram.addListener(LiveTranscriptionEvents.Transcript, (data) => {
    const transcript = data.channel.alternatives[0].transcript;
    if (transcript !== "") {
      if (data.is_final) {
        is_finals.push(transcript);
        if (data.speech_final) {
          const utterance = is_finals.join(" ");
          is_finals = [];
          console.log(
            `Deepgram STT: [Speech Final] ${utterance} (ID: ${connectionId})`
          );

          promptLLM(ws, initialPrompt, utterance, voiceId, connectionId);
        } else {
          console.log(
            `Deepgram STT: [Is Final] ${transcript} (ID: ${connectionId})`
          );
        }
      } else {
        console.log(
          `Deepgram STT: [Interim Result] ${transcript} (ID: ${connectionId})`
        );
      }
    }
  });

  deepgram.addListener(LiveTranscriptionEvents.UtteranceEnd, () => {
    if (is_finals.length > 0) {
      const utterance = is_finals.join(" ");
      is_finals = [];
      console.log(
        `Deepgram STT: [Speech Final] ${utterance} (ID: ${connectionId})`
      );
      promptLLM(ws, utterance, voiceId, connectionId);
    }
  });

  deepgram.addListener(LiveTranscriptionEvents.Close, () => {
    console.log(`Deepgram STT: Disconnected (ID: ${connectionId})`);
    clearInterval(keepAlive);
    deepgram.removeAllListeners();
  });

  deepgram.addListener(LiveTranscriptionEvents.Error, (error) => {
    console.error(`Deepgram STT error (ID: ${connectionId}):`, error);
  });

  ws.on("message", (message) => {
    console.log(
      `WebSocket: Client data received (ID: ${connectionId})`,
      typeof message,
      message.length,
      "bytes"
    );

    if (deepgram.getReadyState() === 1) {
      deepgram.send(message);
    } else {
      console.log(
        `WebSocket: Data queued for Deepgram. Current state: ${deepgram.getReadyState()} (ID: ${connectionId})`
      );
      audioQueue.push(message);
    }
  });

  ws.on("close", () => {
    console.log(`WebSocket: Client disconnected (ID: ${connectionId})`);
    clearInterval(keepAlive);
    deepgram.removeAllListeners();
    connections.delete(connectionId);
  });

  keepAlive = setInterval(() => {
    deepgram.keepAlive();
  }, 10 * 1000);

  connections.set(connectionId, {
    ...connections.get(connectionId),
    ws,
    deepgram,
  });
}

async function promptLLM(ws, initialPrompt, prompt, voiceId, connectionId) {
  try {
    // pushing the user response
    messages.push({
      role: "user",
      content: prompt,
    });

    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [...messages],
      temperature: 0.4,
      top_p: 1,
      stream: true,
    });

    let fullResponse = "";
    let playHTStream = null;

    for await (const chunk of stream) {
      if (!connections.has(connectionId)) {
        console.log(
          `LLM process stopped: Connection ${connectionId} no longer exists`
        );
        break;
      }

      const chunkMessage = chunk.choices[0]?.delta?.content || "";
      fullResponse += chunkMessage;

      ws.send(JSON.stringify({ type: "text", content: chunkMessage }));

      // get audio chunk by chunk
    }

    // pushing the gpt response
    messages.push({
      role: "assistant",
      content: fullResponse,
    });

    console.log(fullResponse);

    if (!playHTStream && fullResponse.length > 0) {
      playHTStream = await PlayHT.stream(fullResponse, streamingOptions);

      playHTStream.on("data", (chunk) => {
        if (!connections.has(connectionId)) {
          console.log(
            `PlayHT process stopped: Connection ${connectionId} no longer exists`
          );
          playHTStream.cancel();
          return;
        }
        ws.send(chunk);
      });

      playHTStream.on("end", () => {
        console.log(`PlayHT streaming completed (ID: ${connectionId})`);
        playHTStream = null;
      });

      playHTStream.on("error", (error) => {
        console.error(`PlayHT streaming error (ID: ${connectionId}):`, error);
      });
    }
  } catch (error) {
    console.error(`Error in promptLLM (ID: ${connectionId}):`, error);
  }
}

const port = 8080;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
