// src/lessons/elevator/content.json
var content_default = {
  slug: "elevator",
  title: "Mission: The Elevator",
  subtitle: "Build the elevator and learn how it goes up and down.",
  summary: "Meet the elevator, learn its parts, and send the cab up to the top floor.",
  badge: "LIFT",
  color: "#20a7f1",
  activity: "lift",
  activityLabel: "Ride the elevator.",
  activityInstruction: "Press the button to send the elevator cab up and down the shaft.",
  difficulty: 1,
  topics: ["elevator parts", "cable", "pulley", "up and down"],
  classIds: ["Brickmoto"],
  storyVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  warmupVideoUrl: "https://www.youtube.com/embed/pn1qJET81a4",
  storyQuestions: [
    {
      prompt: "Which way does an elevator go?",
      answers: ["Up and down", "Left and right", "In circles"],
      correctIndex: 0,
      success: "Elevators move up and down."
    },
    {
      prompt: "What carries people in the elevator?",
      answers: ["The cab", "The roof", "The stairs"],
      correctIndex: 0,
      success: "People ride inside the cab."
    },
    {
      prompt: "What pulls the elevator up?",
      answers: ["A strong cable", "A fan", "A spring"],
      correctIndex: 0,
      success: "A strong cable lifts the cab."
    },
    {
      prompt: "What do you press to call the elevator?",
      answers: ["A button", "A bell", "A lock"],
      correctIndex: 0,
      success: "Pressing a button calls the elevator."
    }
  ],
  quiz: [
    {
      prompt: "Which part is the room people stand in?",
      answers: ["The cab", "The cable", "The button"],
      correctIndex: 0,
      success: "The cab is where people ride."
    },
    {
      prompt: "What opens and closes for people to get in?",
      answers: ["The doors", "The roof", "The floor"],
      correctIndex: 0,
      success: "Doors open and close at each floor."
    },
    {
      prompt: "What moves the elevator up and down?",
      answers: ["The cable and pulley", "The lights", "The windows"],
      correctIndex: 0,
      success: "The cable winds around a pulley to move the cab."
    },
    {
      prompt: "Why do elevators have a counterweight?",
      answers: ["To balance the cab", "To make it louder", "To carry extra people"],
      correctIndex: 0,
      success: "A counterweight helps the motor lift more easily."
    }
  ],
  parts: [
    {
      id: "cab",
      label: "Cab",
      fact: "The cab is the room that carries people up and down.",
      help: "The box in the middle of the shaft."
    },
    {
      id: "doors",
      label: "Doors",
      fact: "The doors slide open to let people in and close for the ride.",
      help: "The sliding panels on the cab."
    },
    {
      id: "cable",
      label: "Cable",
      fact: "A strong steel cable pulls the cab up and lets it down gently.",
      help: "The rope going up from the top of the cab."
    },
    {
      id: "pulley",
      label: "Pulley",
      fact: "The pulley wheel guides the cable and helps the motor move the cab.",
      help: "The wheel at the top of the shaft."
    },
    {
      id: "button",
      label: "Button",
      fact: "The button tells the elevator which floor you want.",
      help: "The round button inside the cab."
    }
  ]
};

export {
  content_default
};
