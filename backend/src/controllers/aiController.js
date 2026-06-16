const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// In a real app, store this in .env.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `
You are Turf Assistant, an AI guide for the Turf Score app.
Your job is to guide users on how to use the app and check their stats.
If the user asks how to book a turf, explain the steps clearly: "To book a turf, go to the Home screen, search or select a turf, pick a date and time slot, and proceed to checkout." DO NOT attempt to book it for them.
If they ask about their profile or history, CALL the getUserProfile function.

Keep responses concise, friendly, and enthusiastic.
`;

const tools = [
  {
    name: "getUserProfile",
    description: "Get the current user's profile, stats, and bookings",
    parameters: {
      type: "object",
      properties: {}
    }
  }
];

exports.chat = async (req, res) => {
  try {
    const { history, message } = req.body;
    const userId = req.userId;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: tools }]
    });

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    let responseText = result.response.text();
    const calls = result.response.functionCalls();

    let newHistory = [...(history || []), { role: 'user', parts: [{ text: message }] }];

    if (calls && calls.length > 0) {
      const call = calls[0];
      const functionName = call.name;
      const args = call.args;

      let functionResponseData = {};

      if (functionName === 'getUserProfile') {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { bookings: { take: 3, orderBy: { createdAt: 'desc' } } }
        });
        functionResponseData = { 
          matchesPlayed: user.matchesPlayed, 
          rating: user.rating, 
          recentBookings: user.bookings.length 
        };
      }

      // Send the function response back to Gemini
      const secondResult = await chat.sendMessage([{
        functionResponse: {
          name: functionName,
          response: functionResponseData
        }
      }]);

      responseText = secondResult.response.text();
      newHistory.push({ role: 'model', parts: [{ functionCall: call }] });
      newHistory.push({ role: 'user', parts: [{ functionResponse: { name: functionName, response: functionResponseData } }] });
    }

    newHistory.push({ role: 'model', parts: [{ text: responseText }] });

    res.json({
      reply: responseText,
      history: newHistory
    });

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
};
