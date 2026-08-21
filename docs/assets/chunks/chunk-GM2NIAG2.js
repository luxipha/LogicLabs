// src/lessons/mobile-radar/content.json
var content_default = {
  slug: "mobile-radar",
  title: "Mission: The Picnic",
  subtitle: "Build the radar truck and scan for signals.",
  summary: "Meet the mobile radar vehicle, learn its parts, and spin the radar to find signals.",
  badge: "RADAR",
  color: "#20a7f1",
  activity: "scan",
  activityLabel: "Spin the radar.",
  activityInstruction: "Turn on the radar and scan around to find the hidden signal.",
  difficulty: 1,
  topics: ["radar parts", "signal", "wheel", "antenna"],
  classIds: ["Brickmoto"],
  storyVideoUrl: "https://www.youtube.com/embed/mwVSrqLdk-4",
  warmupVideoUrl: "https://www.youtube.com/embed/pn1qJET81a4",
  storyQuestions: [
    {
      prompt: "What are the children getting ready for?",
      answers: ["A picnic", "A race", "A swim"],
      correctIndex: 0,
      success: "The children are getting ready for a picnic."
    },
    {
      prompt: "Are the clouds near or far away?",
      answers: ["Near", "Far away", "In the water"],
      correctIndex: 1,
      success: "The clouds are far away."
    },
    {
      prompt: "Why can't they see the storm clearly?",
      answers: ["Because it is too far away", "Because it is night", "Because it is behind them"],
      correctIndex: 0,
      success: "The storm is too far away to see clearly."
    },
    {
      prompt: "What could help us look or search far away?",
      answers: ["A machine that can search far away", "A bigger picnic", "A louder voice"],
      correctIndex: 0,
      success: "A machine that can search far away would help."
    }
  ],
  quiz: [
    {
      prompt: "Which part sends and receives signals?",
      answers: ["The radar dish", "The bumper", "The mirror"],
      correctIndex: 0,
      success: "The radar dish sends and receives signals."
    },
    {
      prompt: "What do the wheels do?",
      answers: ["Help the truck move", "Spin the dish", "Hold the antenna"],
      correctIndex: 0,
      success: "Wheels help the truck move."
    },
    {
      prompt: "What is the tall part on top called?",
      answers: ["The antenna", "The horn", "The ladder"],
      correctIndex: 0,
      success: "The antenna picks up signals."
    },
    {
      prompt: "What does the cab hold?",
      answers: ["The driver", "The radar", "The wheels"],
      correctIndex: 0,
      success: "The cab holds the driver."
    }
  ],
  parts: [
    {
      id: "antenna",
      label: "Antenna",
      fact: "The antenna reaches high to pick up distant signals.",
      help: "The tall pole on top."
    },
    {
      id: "radar-dish",
      label: "Radar Dish",
      fact: "The dish spins and scans for signals in every direction.",
      help: "The round dish on the mast."
    },
    {
      id: "cab",
      label: "Cab",
      fact: "The cab is where the driver sits and steers.",
      help: "The front part with windows."
    },
    {
      id: "body",
      label: "Body",
      fact: "The body carries the radar equipment.",
      help: "The long middle part."
    },
    {
      id: "wheels",
      label: "Wheels",
      fact: "The wheels roll the radar truck to new places.",
      help: "The round parts at the bottom."
    }
  ]
};

export {
  content_default
};
