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
  storyVideoUrl: "https://www.youtube.com/embed/_s7XMkKfgN8",
  sketchfabEmbedUrl: "https://sketchfab.com/models/61ded500c8fa498d8ae7eeb2ba546df9/embed",
  warmupVideoUrl: "https://www.youtube.com/embed/VSWR6oIVjR4",
  storyQuestions: [
    {
      prompt: "What is in the box?",
      answers: ["Robot parts", "Toys", "Books"],
      correctIndex: 0,
      success: "The box has robot parts inside."
    },
    {
      prompt: "Is the box light or heavy?",
      answers: ["Heavy", "Light", "Medium"],
      correctIndex: 0,
      success: "The box is heavy."
    },
    {
      prompt: "Where does the box need to go?",
      answers: ["Upstairs", "Downstairs", "Outside"],
      correctIndex: 0,
      success: "The box needs to go upstairs."
    },
    {
      prompt: "Can the teacher carry it easily?",
      answers: ["No", "Yes", "Sometimes"],
      correctIndex: 0,
      success: "The box is too heavy for the teacher to carry easily."
    },
    {
      prompt: "What do we need to do?",
      answers: ["Lift the box", "Open the box", "Hide the box"],
      correctIndex: 0,
      success: "We need to lift the box."
    },
    {
      prompt: "Should our machine move up or down?",
      answers: ["Up and down", "Only up", "Only down"],
      correctIndex: 0,
      success: "Our machine should move up and down."
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
      id: "motor",
      label: "Motor",
      fact: "The motor turns the pulley to move the elevator safely.",
      help: "The machine at the top of the shaft."
    },
    {
      id: "counterweight",
      label: "Counterweight",
      fact: "The counterweight balances the cab so the motor does not need to lift everything alone.",
      help: "The stacked block that travels opposite the cab."
    }
  ]
};

export {
  content_default
};
