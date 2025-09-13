const  {GoogleGenAI}= require('@google/genai');
require("dotenv").config(); // load .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


const ai = new GoogleGenAI({apiKey: "AIzaSyBApl-_-a1dExinIV1Lnx3CAdetconNcBU"});

async function main(msg) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents:msg
  //   contents: [
  // {
  //   role: "user",
  //   parts: [{ text: "Hi, can you explain what JavaScript is?" }]
  // }
//   ,{
//     role: "model",
//     parts: [{ text: "Sure! JavaScript is a versatile programming language mainly used to add interactivity to websites. It runs in the browser and can also be used on the server with Node.js." }]
//   },
//   {
//     role: "user",
//     parts: [{ text: "Great! Can you give me an example of a simple function?" }]
//   },
//   {
//     role: "model",
//     parts: [{ text: "Of course! Here's a simple JavaScript function:\n\n```js\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('Abhinav'));\n```" }]
//   },
//   {
//     role: "user",
//     parts: [{ text: "Nice, and what is the difference between var, let, and const?" }]
//   }
//   ,{
//     role: "model",
//     parts: [{ text: "`var` is function-scoped, while `let` and `const` are block-scoped. `let` can be reassigned, but `const` cannot be reassigned after initialization." }]
//   }
// ]
  });
  return response.text;
}
module.exports=main;
